import Konva from 'konva';
import { RippleAnimation } from '../../animations/ripple.animation';
import { Theme } from '../../models/interfaces/theme';
import { Cursor } from './cursor-state';
import { DependencyTree } from './dependency-tree';
import { TreeNode } from './node/tree-node';

export const CONNECTOR_NAME = 'nodeConnector';
export const CONNECTOR_CIRCLE_NAME = 'nodeConnectorCircle';

export class NodeConnector {
  konvaObject: Konva.Group;
  private _connectorCircle: Konva.Circle;
  private _rippleCircle: Konva.Circle;
  private _rippleAnimation: RippleAnimation;

  constructor(nodeWidth: number, nodeHeight: number, node: TreeNode) {
    this._createKonvaObject(nodeWidth / 2, nodeHeight);
    this._rippleAnimation = new RippleAnimation(this._rippleCircle, node.parentDepTree.treeLayer);
    this._initKonvaEvents(node.parentDepTree, node);
  }

  /**
   * Animates ripple around the connector.
   *
   * @param maxRadius Maximal radius the ripple can reach.
   * @param defaultOpacity Opacity in the default state.
   */
  animateRipple(maxRadius: number, defaultOpacity: number): void {
    this._rippleAnimation.animate(maxRadius, defaultOpacity);
  }

  /**
   * Unanimates the ripple if the animation didn't end properly.
   */
  unanimateRipple(): void {
    this._rippleAnimation.unanimate();
  }

  changeTheme(theme: Theme): void {
    this._connectorCircle.fill(theme.primary);
  }

  private _createKonvaObject(x: number, y: number): void {
    this.konvaObject = new Konva.Group({ name: CONNECTOR_NAME });
    this._rippleCircle = new Konva.Circle({
      radius: 0,
      fill: '#979797',
      opacity: 0.2,
      x,
      y
    });

    this._connectorCircle = new Konva.Circle({
      name: CONNECTOR_CIRCLE_NAME,
      radius: 7,
      fill: '#ff5543',
      hitStrokeWidth: 10,
      x,
      y
    });

    this.konvaObject.add(this._rippleCircle);
    this.konvaObject.add(this._connectorCircle);
  }

  private _initKonvaEvents(depTree: DependencyTree, node: TreeNode): void {
    this.konvaObject.on('mouseenter', () => {
      depTree.cursorState.setCursor(Cursor.POINTER);
    });

    this.konvaObject.on('mouseleave', () => {
      depTree.cursorState.unsetCursor(Cursor.POINTER);
      this.unanimateRipple();
    });

    this.konvaObject.on('click', event => {
      if (depTree.draggedEdge || depTree.toolState.isDeleteEnabled || depTree.toolState.isSwapEnabled) {
        return;
      }
      event.cancelBubble = true;

      depTree.clickedNode = node;
      depTree.createDraggedEdge(node);
    });
    this.konvaObject.on('mousedown', () => this.animateRipple(15, 0.2));
    this.konvaObject.on('mouseup', () => this.unanimateRipple());
  }
}
