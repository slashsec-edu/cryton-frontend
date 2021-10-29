import Konva from 'konva';
import { StrokeAnimation } from '../../animations/stroke.animation';
import { Cursor } from './cursor-state';
import { NODE_WIDTH, NODE_HEIGHT, TreeNode } from './tree-node';
import { CrytonEdge } from '../cryton-edge/cryton-edge';
import { DependencyTree } from './dependency-tree';
import { CrytonStepEdge } from '../cryton-edge/cryton-step-edge';
import { NodeType } from '../../models/enums/node-type';
import { Theme } from '../../models/interfaces/theme';

export const EDGE_POINTER_LENGTH = 10;

export class TreeEdge {
  crytonEdge: CrytonEdge;
  konvaObject: Konva.Arrow;
  strokeAnimation: StrokeAnimation;

  constructor(crytonEdge: CrytonEdge) {
    this.crytonEdge = crytonEdge;
    this._initKonvaObject();
  }

  set color(color: string) {
    this.konvaObject.stroke(color);
    this.konvaObject.fill(color);
  }

  get parentNode(): TreeNode {
    return this.crytonEdge.parentNode.treeNode;
  }

  get childNode(): TreeNode {
    return this.crytonEdge.childNode.treeNode;
  }

  get depTree(): DependencyTree {
    return this.crytonEdge.depTree;
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
    points[1] = y + EDGE_POINTER_LENGTH / 2;

    this._moveEdge(points);
  }

  changeTheme(theme: Theme): void {
    this.color = theme.templateCreator.treeEdge;
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
      objectType: 'edge',
      shadowForStrokeEnabled: false
    });

    if (this.depTree.theme) {
      this.color = this.depTree.theme.templateCreator.treeEdge;
    }

    this.strokeAnimation = new StrokeAnimation(this.konvaObject, this.konvaObject, this.depTree.treeLayer);

    this.konvaObject.on('mouseenter', () => {
      if (this.depTree.toolState.isDeleteEnabled) {
        this.depTree.cursorState.setCursor(Cursor.POINTER);
        this.strokeAnimation.activate(this.depTree.theme.primary);
      } else if (this.crytonEdge.nodeType === NodeType.CRYTON_STEP) {
        this.depTree.cursorState.setCursor(Cursor.POINTER);
        this.color = this.depTree.theme.primary;
        this.crytonEdge.depTree.treeLayer.draw();
      }
    });
    this.konvaObject.on('mouseleave', () => {
      this.depTree.cursorState.unsetCursor(Cursor.POINTER);
      this.color = this.depTree.theme.templateCreator.treeEdge;
      this.crytonEdge.depTree.treeLayer.draw();
    });
    this.konvaObject.on('click', () => {
      if (this.depTree.toolState.isDeleteEnabled) {
        this.crytonEdge.destroy();
      } else {
        if (this.crytonEdge.nodeType === NodeType.CRYTON_STEP) {
          (this.crytonEdge as CrytonStepEdge).emitEditEvent();
        }
      }
    });
  }
}
