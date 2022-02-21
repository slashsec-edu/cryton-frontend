import Konva from 'konva';
import { Vector2d } from 'konva/lib/types';
import { Subject } from 'rxjs';
import { Queue } from 'src/app/modules/shared/utils/queue';
import { Alert } from '../../../shared/models/interfaces/alert.interface';
import { NodeType } from '../../models/enums/node-type';
import { BoundingRect } from '../../models/interfaces/bounding-rect';
import { Theme } from '../../models/interfaces/theme';
import { KonvaWrapper } from '../konva/konva-wrapper';
import { CANVAS_PADDING } from './dependency-graph-constants';
import { GraphEdge, GRAPH_EDGE_NAME } from './edge/graph-edge';
import { StageEdge } from './edge/stage-edge';
import { StepEdge } from './edge/step-edge';
import { NodeManager } from './node-manager';
import { GraphNode, GRAPH_NODE_NAME, NODE_HEIGHT, NODE_WIDTH } from './node/graph-node';
import { StageNode } from './node/stage-node';
import { StepNode } from './node/step-node';
import { ToolState } from './tool-state';

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 1.5;

export class DependencyGraph extends KonvaWrapper {
  alert$ = new Subject<Alert>();
  graphLayerUpdate$ = new Subject<Konva.Layer>();

  // STATE
  toolState = new ToolState();
  graphNodeManager: NodeManager;

  // EDGE DATA
  draggedEdge: GraphEdge; // Reference to the dragged edge.
  clickedNode: GraphNode; // Group where the arrow drag started.

  nodeType: NodeType;
  graphLayer = new Konva.Layer();

  constructor(nodeType: NodeType) {
    super();
    this.nodeType = nodeType;
    this.graphNodeManager = new NodeManager(this);
  }

  /**
   * Frees resources taken up by this object.
   */
  destroy(): void {
    super.destroy();
    this.clickedNode = null;
    this.alert$.complete();
    this.graphLayerUpdate$.complete();
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
      this.graphLayer.draw();
    }
  }

  /**
   * Rescales and moves the stage so that the whole dependency graph is
   * visible and centered.
   */
  fitScreen(): void {
    if (!this.stage) {
      return;
    }
    this.stage.x(0).y(0);

    const nodes = this.findNodesByName(GRAPH_NODE_NAME, this.graphLayer) as Konva.Group[];
    const edges = this.findNodesByName(GRAPH_EDGE_NAME, this.graphLayer) as Konva.Arrow[];
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
    this.graphLayer.draw();
  }

  /**
   * Adds node to the dependency graph.
   *
   * @param node Node to add.
   */
  addNode(node: GraphNode): void {
    if (this.toolState.isMoveNodeEnabled) {
      node.konvaObject.draggable(true);
    }
    this.graphLayer.add(node.konvaObject);
    this.graphLayer.draw();
  }

  /**
   * Creates a dragged edge with a starting point at the parent node.
   *
   * @param parentNode Parent node of the edge.
   * @returns Dragged edge.
   */
  createDraggedEdge(parentNode: GraphNode): GraphEdge {
    if (parentNode instanceof StageNode) {
      this.draggedEdge = new StageEdge(this, parentNode);
    } else {
      this.draggedEdge = new StepEdge(this, parentNode);
    }
    this.graphLayer.add(this.draggedEdge.konvaObject);
    this.draggedEdge.konvaObject.moveToBottom();

    return this.draggedEdge;
  }

  /**
   * Clones the current layer and emits layer update.
   */
  emitLayerUpdate(): void {
    const layerClone = this.graphLayer.clone() as Konva.Layer;
    this.graphLayerUpdate$.next(layerClone);
  }

  /**
   * Connects dragged edge to the child node.
   *
   * @param childNode GraphNode where edge ends.
   */
  connectDraggedEdge(childNode: GraphNode): void {
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
    this.graphLayer.draw();
  }

  /**
   * Makes a copy of the entire dependency graph.
   *
   * @returns Copied dependency graph.
   */
  copy(): DependencyGraph {
    const initialNodes = this.findInitialNodes();
    const graphCopy = new DependencyGraph(this.nodeType);
    graphCopy.theme = this.theme;

    [graphCopy.scale, graphCopy.stageX, graphCopy.stageY] = [this.scale, this.stageX, this.stageY];

    if (initialNodes.length === 0) {
      return graphCopy;
    }

    initialNodes.forEach(initialNode => {
      this._copyGraphSection(initialNode, graphCopy);
    });

    return graphCopy;
  }

  /**
   * Checks if the dependency graph is valid.
   *
   * @returns True if dependency graph is valid.
   */
  isValid(): boolean {
    const nodeCount = this.graphNodeManager.nodes.length;

    if (nodeCount === 0) {
      return false;
    }

    return true;
  }

  /**
   * Updates every edge inside the dependency graph.
   */
  updateAllEdges(): void {
    const nodes = this.graphNodeManager.nodes;
    nodes.forEach((node: GraphNode) => node.updateEdges());
  }

  /**
   * Returns an array of active errors.
   *
   * @returns Array of error messages.
   */
  errors(): string[] {
    const errors: string[] = [];
    const nodeCount = this.graphNodeManager.nodes.length;

    if (nodeCount === 0) {
      errors.push('Dependency graph is empty.');
    }

    return errors;
  }

  /**
   * Updates theme colors inside dependency graph.
   *
   * @param theme New color theme.
   */
  updateTheme(theme: Theme): void {
    this.graphNodeManager.nodes.forEach(node => {
      node.changeTheme(theme);
    });
    this._getAllEdges().forEach(edge => {
      edge.changeTheme(theme);
    });
  }

  /**
   * Finds all initial nodes in the dependency graph.
   *
   * @returns Array of initial nodes.
   */
  findInitialNodes(): GraphNode[] {
    return this.graphNodeManager.nodes.filter(node => node.parentEdges.length === 0);
  }

  /**
   * Refreshes dependency graph color theme.
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

    this.stage.add(this.graphLayer);
    this._initKonvaEvents();
  }

  private _copyGraphSection(initialNode: GraphNode, graphCopy: DependencyGraph): void {
    const queue = new Queue<GraphNode>();
    queue.enqueue(initialNode);
    const copyMap: Record<string, GraphNode> = {};

    this._copyNode(initialNode, graphCopy, copyMap);

    while (queue.length > 0) {
      const currentNode = queue.dequeue();

      currentNode.childEdges.forEach((edge: GraphEdge) => {
        const childNode = edge.childNode;
        let nodeCopy = copyMap[childNode.name];

        if (!nodeCopy) {
          queue.enqueue(edge.childNode);
          nodeCopy = this._copyNode(childNode, graphCopy, copyMap);
        }

        const edgeCopy = graphCopy.createDraggedEdge(copyMap[edge.parentNode.name]);

        if (graphCopy.nodeType === NodeType.CRYTON_STEP) {
          (edgeCopy as StepEdge).conditions = (edge as StepEdge).conditions;
        }

        graphCopy.connectDraggedEdge(nodeCopy);
      });
    }
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
        this.graphLayer.batchDraw();
      }
    });

    this.stage.on('click', e => {
      if (e.target === this.stage) {
        this._destroyDraggedEdge();
        this.graphLayer.draw();
      }
    });
  }

  /**
   * Returns all edges inside the dependency graph.
   */
  private _getAllEdges(): GraphEdge[] {
    const edges: GraphEdge[] = [];
    const nodes = this.graphNodeManager.nodes;

    nodes.forEach(node => edges.push(...node.childEdges));
    return edges;
  }

  /**
   * Makes a copy of a node.
   *
   * @param node Node to copy.
   * @param graphCopy New dependecy graph.
   * @param copyMap Record with node names and their copies.
   * @returns Copied node.
   */
  private _copyNode(node: GraphNode, graphCopy: DependencyGraph, copyMap: Record<string, GraphNode>): GraphNode {
    let nodeCopy: GraphNode;

    if (node instanceof StepNode) {
      nodeCopy = new StepNode(node.name, node.attackModule, node.attackModuleArgs);
      nodeCopy.setParentDepGraph(graphCopy);
    } else if (node instanceof StageNode) {
      throw new Error('Cannot copy stage node.');
    }

    copyMap[node.name] = nodeCopy;
    graphCopy.graphNodeManager.addNode(nodeCopy);
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
   * inside the dependency graph.
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
   * Calculates the scale factor needed to fit the dependency graph inside the canvas.
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
