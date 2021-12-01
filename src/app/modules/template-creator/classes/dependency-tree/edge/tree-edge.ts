import Konva from 'konva';
import { StrokeAnimation } from '../../../animations/stroke.animation';
import { Cursor } from '../cursor-state';
import { NODE_WIDTH, NODE_HEIGHT, TreeNode } from '../node/tree-node';
import { DependencyTree } from '../dependency-tree';
import { Theme } from '../../../models/interfaces/theme';

export const EDGE_POINTER_LENGTH = 10;
export const TREE_EDGE_NAME = 'treeEdge';

export abstract class TreeEdge {
  parentNode: TreeNode;
  childNode: TreeNode;

  depTree: DependencyTree;
  konvaObject: Konva.Arrow;
  strokeAnimation: StrokeAnimation;

  constructor(depTree: DependencyTree, parentNode: TreeNode) {
    this.depTree = depTree;
    this.parentNode = parentNode;
    this._initKonvaObject();
  }

  set color(color: string) {
    this.konvaObject.stroke(color);
    this.konvaObject.fill(color);
  }

  /**
   * Moves the starting point of edge to the center of the connector of parent node.
   */
  moveToParentNode(): void {
    const nodeCenterX = this.parentNode.konvaObject.x() + NODE_WIDTH / 2;
    const nodeBottomY = this.parentNode.konvaObject.y() + NODE_HEIGHT;
    this.moveEdgeStart(nodeCenterX, nodeBottomY);
  }

  /**
   * Moves the ending point of edge to the top middle of the child node.
   */
  moveToChildNode(): void {
    if (!this.childNode) {
      throw new Error("Child node isn't set.");
    }
    const nodeCenterX = this.childNode.konvaObject.x() + NODE_WIDTH / 2;
    this.moveEdgeEnd(nodeCenterX, this.childNode.konvaObject.y());
  }

  /**
   * Returns default arrow points.
   * Arrow starts and ends in the middle of the red connector circle by default.
   */
  getDefaultPoints(): number[] {
    const nodeX = this.parentNode.konvaObject.x();
    const nodeY = this.parentNode.konvaObject.y();

    const centerX = nodeX + NODE_WIDTH / 2;
    const bottomY = nodeY + NODE_HEIGHT;

    return [centerX, bottomY, centerX, bottomY];
  }

  /**
   * Moves edge arrow end points.
   *
   * @param x X coordinate.
   * @param y Y coordinate.
   */
  moveEdgeEnd(x: number, y: number): void {
    const points = this.konvaObject.points();

    // Factor in the arrow length so it doesn't stick out
    points[2] = x;
    points[3] = y + EDGE_POINTER_LENGTH / 2;

    this._moveEdge(points);
  }

  /**
   * Moves edge arrow start points.
   *
   * @param x Xcoordinate.
   * @param y Y coordinate.
   */
  moveEdgeStart(x: number, y: number): void {
    const points = this.konvaObject.points();

    // Factor in the arrow length so it doesn't stick out
    points[0] = x;
    points[1] = y;

    this._moveEdge(points);
  }

  changeTheme(theme: Theme): void {
    this.color = theme.templateCreator.treeEdge;
  }

  /**
   * Checks if edge from parent node to child node is a correct edge.
   * There must be no cycles.
   * There can't already be the same edge.
   */
  isCorrectEdge(): void {
    for (const childEdge of this.parentNode.childEdges) {
      if (childEdge !== this && childEdge.childNode === this.childNode) {
        throw new Error('Edge already exists.');
      }
    }
    if (this.doesCreateCycle()) {
      throw new Error('Edge creates a cycle.');
    }
  }

  /**
   * Checks if edge creates a cycle.
   *
   * @param startEdge Edge where call stack started, should be left empty.
   * @returns True if edge creates a cycle.
   */
  doesCreateCycle(startEdge: TreeEdge = this): boolean {
    return this.childNode.childEdges.some(childEdge => childEdge === startEdge || childEdge.doesCreateCycle(startEdge));
  }

  /**
   * Connects edge to the child node.
   *
   * @param childNode Child node to connect to.
   */
  connect(childNode: TreeNode): void {
    this.childNode = childNode;
    this.parentNode.addChildEdge(this);
    this.childNode.addParentEdge(this);
    try {
      this.isCorrectEdge();
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  /**
   * Destroys edge.
   */
  destroy(): void {
    this.parentNode.removeChildEdge(this);
    this.childNode?.removeParentEdge(this);
    this.konvaObject.destroy();
  }

  protected _onMouseEnter(): void {
    if (this.depTree.toolState.isDeleteEnabled) {
      this.depTree.cursorState.setCursor(Cursor.POINTER);
      this.strokeAnimation.activate(this.depTree.theme.primary);
    }
    this.depTree.treeLayer.draw();
  }
  protected _onMouseLeave(): void {
    this.depTree.cursorState.unsetCursor(Cursor.POINTER);
    this.color = this.depTree.theme.templateCreator.treeEdge;
    this.depTree.treeLayer.draw();
  }
  protected _onClick(): void {
    if (this.depTree.toolState.isDeleteEnabled) {
      this.destroy();
    }
  }

  /**
   * Moves edge arrow points to the new destination.
   *
   * @param points New arrow points.
   */
  private _moveEdge(points: number[]): void {
    this.konvaObject.points(points);
  }

  /**
   * Initializes edge konva object.
   */
  private _initKonvaObject(): void {
    this.konvaObject = new Konva.Arrow({
      EDGE_POINTER_LENGTH,
      strokeWidth: 3,
      pointerWidth: 7,
      points: this.getDefaultPoints(),
      listening: false,
      hitStrokeWidth: 15,
      name: TREE_EDGE_NAME,
      shadowForStrokeEnabled: false
    });

    if (this.depTree.theme) {
      this.color = this.depTree.theme.templateCreator.treeEdge;
    }

    this.strokeAnimation = new StrokeAnimation(this.konvaObject, this.konvaObject, this.depTree.treeLayer);

    this.konvaObject.on('mouseenter', () => {
      this._onMouseEnter();
    });
    this.konvaObject.on('mouseleave', () => {
      this._onMouseLeave();
    });
    this.konvaObject.on('click', () => {
      this._onClick();
    });
  }
}
