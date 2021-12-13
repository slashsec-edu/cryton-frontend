import Konva from 'konva';
import { Vector2d } from 'konva/types/types';
import { Subject } from 'rxjs';
import { BoundingRect } from '../../models/interfaces/bounding-rect';
import { TreeNode, NODE_HEIGHT, NODE_WIDTH } from './node/tree-node';
import { ToolState } from './tool-state';
import { NodeManager } from './node-manager';
import { KonvaWrapper } from '../konva/konva-wrapper';
import { Alert } from '../../../shared/models/interfaces/alert.interface';
import { NodeType } from '../../models/enums/node-type';
import { Theme } from '../../models/interfaces/theme';
import { Queue } from 'src/app/modules/shared/utils/queue';
import { CANVAS_PADDING } from './dependency-tree-constants';
import { TreeEdge } from './edge/tree-edge';
import { StageNode } from './node/stage-node';
import { StageEdge } from './edge/stage-edge';
import { StepEdge } from './edge/step-edge';
import { StepNode } from './node/step-node';

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 1.5;

export class DependencyTree extends KonvaWrapper {
  alert$ = new Subject<Alert>();
  treeLayerUpdate$ = new Subject<Konva.Layer>();

  // STATE
  toolState = new ToolState();
  treeNodeManager: NodeManager;

  // EDGE DATA
  draggedEdge: TreeEdge; // Reference to the dragged edge.
  clickedNode: TreeNode; // Group where the arrow drag started.

  nodeType: NodeType;
  treeLayer = new Konva.Layer();

  constructor(nodeType: NodeType) {
    super();
    this.nodeType = nodeType;
    this.treeNodeManager = new NodeManager(this);
  }

  /**
   * Frees resources taken up by this object.
   */
  destroy(): void {
    super.destroy();
    this.clickedNode = null;
    this.alert$.complete();
    this.treeLayerUpdate$.complete();
  }

  /**
   * Rescales the stage by the increment.
   *
   * @param increment Scale increment.
   */
  rescale(increment: number): void {
    const newScale = this.stage.scale().x + increment;

    if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
      this.stage.scale({ x: newScale, y: newScale });
      this.treeLayer.draw();
    }
  }

  /**
   * Rescales and moves the stage so that the whole dependency tree is
   * visible and centered.
   */
  fitScreen(): void {
    if (!this.stage) {
      return;
    }
    this.stage.x(0).y(0);

    const nodes = this.findNodesByName('treeNode', this.treeLayer) as Konva.Group[];
    const edges = this.findNodesByName('treeEdge', this.treeLayer) as Konva.Arrow[];
    const rect = this._getNodesRect(nodes);

    if (!nodes || !rect) {
      return;
    }

    const boundingRectCenter = this._getRectCenter(rect);
    let scale = 1;

    scale = this._calcRescale(rect.max.x - rect.min.x + CANVAS_PADDING, rect.max.y - rect.min.y + CANVAS_PADDING);
    this.stage.scale({ x: scale, y: scale });

    // The center of the canvas gets moved by the scale factor, hence we need to rescale it to its original position.
    const centeringVector: Vector2d = {
      x: (this.stage.width() / 2) * (1 / scale) - boundingRectCenter.x,
      y: (this.stage.height() / 2) * (1 / scale) - boundingRectCenter.y
    };

    this._centerNodes(nodes, edges, centeringVector);
    this.treeLayer.draw();
  }

  /**
   * Adds node to the dependency tree.
   *
   * @param node Node to add.
   */
  addNode(node: TreeNode): void {
    if (this.toolState.isMoveNodeEnabled) {
      node.konvaObject.draggable(true);
    }
    node.changeTheme(this.theme);
    this.treeLayer.add(node.konvaObject);
    this.treeLayer.draw();
  }

  /**
   * Creates a dragged edge with a starting point at the parent node.
   *
   * @param parentNode Parent node of the edge.
   * @returns Dragged edge.
   */
  createDraggedEdge(parentNode: TreeNode): TreeEdge {
    if (parentNode instanceof StageNode) {
      this.draggedEdge = new StageEdge(this, parentNode);
    } else {
      this.draggedEdge = new StepEdge(this, parentNode);
    }
    this.treeLayer.add(this.draggedEdge.konvaObject);
    this.draggedEdge.konvaObject.moveToBottom();

    return this.draggedEdge;
  }

  /**
   * Clones the current layer and emits layer update.
   */
  emitLayerUpdate(): void {
    const layerClone = this.treeLayer.clone() as Konva.Layer;
    this.treeLayerUpdate$.next(layerClone);
  }

  /**
   * Connects dragged edge to the child node.
   *
   * @param childNode TreeNode where edge ends.
   */
  connectDraggedEdge(childNode: TreeNode): void {
    try {
      this.draggedEdge.connect(childNode);
    } catch (e) {
      if (e instanceof Error) {
        this.alert$.next({ message: e.message, type: 'error' });
      }
      throw e;
    }
    this.draggedEdge.moveToChildNode();

    this.draggedEdge.konvaObject.listening(true);
    this.draggedEdge.konvaObject.moveToBottom();

    this.draggedEdge = null;
    this.treeLayer.draw();
  }

  /**
   * Makes a copy of the entire dependency tree.
   *
   * @returns Copied dependency tree.
   */
  copy(): DependencyTree {
    const rootNode = this.findRootNode();
    const treeCopy = new DependencyTree(this.nodeType);
    const nodeType = treeCopy.nodeType;
    treeCopy.theme = this.theme;

    [treeCopy.scale, treeCopy.stageX, treeCopy.stageY] = [this.scale, this.stageX, this.stageY];

    if (!rootNode) {
      return treeCopy;
    }

    const queue = new Queue<TreeNode>();
    queue.enqueue(rootNode);
    const copyMap: Record<string, TreeNode> = {};

    this._copyNode(rootNode, treeCopy, copyMap);

    while (queue.length > 0) {
      const currentNode = queue.dequeue();

      currentNode.childEdges.forEach((edge: TreeEdge) => {
        const childNode = edge.childNode;
        let nodeCopy = copyMap[childNode.name];

        if (!nodeCopy) {
          queue.enqueue(edge.childNode);
          nodeCopy = this._copyNode(childNode, treeCopy, copyMap);
        }

        const edgeCopy = treeCopy.createDraggedEdge(copyMap[edge.parentNode.name]);

        if (nodeType === NodeType.CRYTON_STEP) {
          (edgeCopy as StepEdge).conditions = (edge as StepEdge).conditions;
        }

        treeCopy.connectDraggedEdge(nodeCopy);
      });
    }

    return treeCopy;
  }

  /**
   * Checks if the dependency tree is valid.
   *
   * @returns True if dependency tree is valid.
   */
  isValid(): boolean {
    const nodeCount = this.treeNodeManager.nodes.length;

    if (nodeCount === 0) {
      return false;
    }

    return true;
  }

  /**
   * Updates every edge inside the dependency tree.
   */
  updateAllEdges(): void {
    const nodes = this.treeNodeManager.nodes;
    nodes.forEach((node: TreeNode) => node.updateEdges());
  }

  /**
   * Returns an array of active errors.
   *
   * @returns Array of error messages.
   */
  errors(): string[] {
    const errors: string[] = [];
    const nodeCount = this.treeNodeManager.nodes.length;

    if (nodeCount === 0) {
      errors.push('Dependency tree is empty.');
    }

    return errors;
  }

  /**
   * Updates theme colors inside dependency tree.
   *
   * @param theme New color theme.
   */
  updateTheme(theme: Theme): void {
    this.treeNodeManager.nodes.forEach(node => {
      node.changeTheme(theme);
    });
    this._getAllEdges().forEach(edge => {
      edge.changeTheme(theme);
    });
  }

  /**
   * Finds a root node of the dependency tree.
   *
   * @returns Root node.
   */
  findRootNode(): TreeNode {
    let rootNode: TreeNode;

    this.treeNodeManager.nodes.forEach((node: TreeNode) => {
      if (node.parentEdges.length === 0) {
        if (!rootNode) {
          rootNode = node;
        } else {
          throw Error('Multiple root nodes in dependency tree.');
        }
      }
    });

    return rootNode;
  }

  /**
   * Refreshes dependency tree color theme.
   */
  protected _refreshTheme(): void {
    this.updateTheme(this.theme);
    this.stage.draw();
  }

  /**
   * Initializes stage container and dimensions.
   *
   * @param container Container element.
   */
  protected _createStage(container: HTMLDivElement): void {
    const { width, height } = this._getBoundingRect(container);

    this.stage = new Konva.Stage({
      container,
      width,
      height,
      x: this._stageX,
      y: this._stageY,
      scale: { x: this._scale, y: this._scale },
      draggable: true
    });

    this.stage.add(this.treeLayer);
    this._initKonvaEvents();
  }

  private _centerNodes(nodes: Konva.Group[], edges: Konva.Arrow[], centeringVector: Vector2d): void {
    for (const node of nodes) {
      node.x(node.x() + centeringVector.x);
      node.y(node.y() + centeringVector.y);
    }

    for (const edge of edges) {
      const points = edge.points();

      points[0] += centeringVector.x;
      points[1] += centeringVector.y;
      points[2] += centeringVector.x;
      points[3] += centeringVector.y;

      edge.points(points);
    }
  }

  /**
   * Initializes konva stage events.
   */
  private _initKonvaEvents(): void {
    this.stage.on('mousemove', event => {
      if (this.draggedEdge) {
        const scale = this.stage.scaleX();
        const x = (event.evt.offsetX - this.stage.x()) * (1 / scale);
        const y = (event.evt.offsetY - this.stage.y()) * (1 / scale);
        this.draggedEdge.moveEdgeEnd(x, y);
        this.treeLayer.batchDraw();
      }
    });

    this.stage.on('click', e => {
      if (e.target === this.stage) {
        this._destroyDraggedEdge();
        this.treeLayer.draw();
      }
    });
  }

  /**
   * Returns all edges inside the dependency tree.
   */
  private _getAllEdges(): TreeEdge[] {
    const edges: TreeEdge[] = [];
    const nodes = this.treeNodeManager.nodes;

    nodes.forEach(node => edges.push(...node.childEdges));
    return edges;
  }

  /**
   * Makes a copy of a node.
   *
   * @param node Node to copy.
   * @param treeCopy New dependecy tree.
   * @param copyMap Record with node names and their copies.
   * @returns Copied node.
   */
  private _copyNode(node: TreeNode, treeCopy: DependencyTree, copyMap: Record<string, TreeNode>): TreeNode {
    let nodeCopy: TreeNode;

    if (node instanceof StepNode) {
      nodeCopy = new StepNode(node.name, node.attackModule, node.attackModuleArgs, treeCopy);
    } else if (node instanceof StageNode) {
      throw new Error('Cannot copy stage node.');
    }

    copyMap[node.name] = nodeCopy;
    treeCopy.treeNodeManager.addNode(nodeCopy);
    nodeCopy.x = node.x;
    nodeCopy.y = node.y;

    return nodeCopy;
  }

  /**
   * Returns the center of the bounding rectangle.
   *
   * @param rect Bounding rectangle of nodes.
   */
  private _getRectCenter(rect: BoundingRect): Vector2d {
    return {
      x: rect.min.x + (rect.max.x - rect.min.x) / 2,
      y: rect.min.y + (rect.max.y - rect.min.y) / 2
    };
  }

  /**
   * Returns max and min values of x and y coordinates of nodes contained
   * inside the execution tree.
   * These coordinates form a bounding rectangle around all nodes.
   */
  private _getNodesRect(nodes: Konva.Group[]): BoundingRect {
    if (nodes.length === 0) {
      return null;
    }

    let maxX: number, maxY: number, minX: number, minY: number;

    for (const node of nodes) {
      if (maxX === undefined) {
        minX = node.x();
        maxX = node.x() + NODE_WIDTH;
        minY = node.y();
        maxY = node.y() + NODE_HEIGHT;
      } else {
        minX = Math.min(minX, node.x());
        maxX = Math.max(maxX, node.x() + NODE_WIDTH);
        minY = Math.min(minY, node.y());
        maxY = Math.max(maxY, node.y() + NODE_HEIGHT);
      }
    }

    return {
      min: { x: minX, y: minY },
      max: { x: maxX, y: maxY }
    };
  }

  /**
   * Calculates the scale factor needed to fit the execution tree inside the canvas.
   *
   * @param rectWidth Width of the bounding rectangle.
   * @param rectHeight Height of the bounding rectangle.
   */
  private _calcRescale(rectWidth: number, rectHeight: number): number {
    const xRescale = this.stage.width() / rectWidth;
    const yRescale = this.stage.height() / rectHeight;
    const minRescale = Math.min(xRescale, yRescale);

    if (minRescale > 1) {
      return 1;
    } else if (minRescale <= MIN_SCALE) {
      return MIN_SCALE;
    }

    return minRescale;
  }

  /**
   * Destroys dragged arrow and resets the variables.
   */
  private _destroyDraggedEdge(): void {
    if (this.draggedEdge) {
      this.draggedEdge.destroy();
      this.draggedEdge = null;
    }
  }
}
