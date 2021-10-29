import Konva from 'konva';
import { DependencyTree } from './dependency-tree';
import { ShortStringPipe } from '../../../shared/pipes/short-string.pipe';
import { StrokeAnimation } from '../../animations/stroke.animation';
import { RippleAnimation } from '../../animations/ripple.animation';
import { Cursor } from './cursor-state';
import { NodeConnector } from './node-connector';
import { SettingsButton, SETTINGS_BTN_PADDING } from './settings-button';
import { CrytonNode } from '../cryton-node/cryton-node';
import { NodeType } from '../../models/enums/node-type';
import { Tabs, TabsRouter } from '../utils/tabs-router';
import { TreeEdge } from './tree-edge';
import { Theme } from '../../models/interfaces/theme';
import { CANVAS_PADDING } from './dependency-tree-constants';

export const NODE_WIDTH = 170;
export const NODE_HEIGHT = 40;

export class TreeNode {
  crytonNode: CrytonNode;
  nodeType: NodeType;

  strokeAnimation: StrokeAnimation;
  konvaObject: Konva.Group;

  private _nameText: Konva.Text;
  private _nodeRect: Konva.Rect;
  private _connector: NodeConnector;

  // X coordinate
  get x(): number {
    return this.konvaObject.x();
  }
  set x(value: number) {
    this.konvaObject.x(value);
  }

  // Y coordinate
  get y(): number {
    return this.konvaObject.y();
  }
  set y(value: number) {
    this.konvaObject.y(value);
  }

  // Moving
  set moving(value: boolean) {
    this.konvaObject.draggable(value);
  }

  get depTree(): DependencyTree {
    return this.crytonNode.parentDepTree;
  }

  get parentEdges(): TreeEdge[] {
    return this.crytonNode.parentEdges.map(edge => edge.treeEdge);
  }

  get childEdges(): TreeEdge[] {
    return this.crytonNode.childEdges.map(edge => edge.treeEdge);
  }

  constructor(crytonNode: CrytonNode, nodeType: NodeType) {
    this.crytonNode = crytonNode;
    this.nodeType = nodeType;
    this._initKonvaObject();
  }

  /**
   * Draws node.
   */
  draw(): void {
    this.konvaObject.draw();
  }

  /**
   * Updates all child and parent edge positions.
   */
  updateEdges(): void {
    this.parentEdges.forEach(edge => edge.moveToChildNode());
    this.childEdges.forEach(edge => edge.moveToParentNode());
  }

  /**
   * Changes name text to a given name.
   *
   * @param name New name.
   */
  changeName(name: string): void {
    this._nameText?.text(new ShortStringPipe().transform(name, 10));
  }

  changeTheme(theme: Theme): void {
    this._nodeRect.fill(theme.templateCreator.treeNodeRect);
    this._changeConnectorTheme(theme.primary);
  }

  private _changeConnectorTheme(primaryColor: string): void {
    this._connector.connectorCircle.fill(primaryColor);
  }

  /**
   * Navigates to correct tab and initializes editing.
   */
  private _handleSettingsBtnClick() {
    this.depTree.treeNodeManager.editNode(this.crytonNode);

    if (this.nodeType === NodeType.CRYTON_STAGE) {
      TabsRouter.selectIndex(Tabs.CREATE_STAGE);
    } else {
      TabsRouter.selectIndex(Tabs.CREATE_STEP);
    }
  }

  /**
   * Initializes node konva object.
   */
  private _initKonvaObject(): void {
    this.konvaObject = new Konva.Group({ objectType: 'treeNode' });
    this._nodeRect = this._createNodeRect();
    const settingsButton = new SettingsButton(this.depTree, NODE_HEIGHT).konvaObject;
    const connector = this._createNodeConnector();
    const name = this._createText(this.crytonNode.name);

    this._initNodePosition();
    this._initNodeEvents(settingsButton);

    this.strokeAnimation = new StrokeAnimation(this._nodeRect, this.konvaObject, this.depTree.treeLayer);

    this.konvaObject.add(this._nodeRect);
    this.konvaObject.add(settingsButton);
    this.konvaObject.add(connector);
    this.konvaObject.add(name);
  }

  /**
   * Initializes node position.
   */
  private _initNodePosition() {
    const stageX = this.depTree?.stageX ?? 0;
    const stageY = this.depTree?.stageY ?? 0;

    this.konvaObject.setAttrs({
      x: CANVAS_PADDING - stageX,
      y: CANVAS_PADDING - stageY
    });
  }

  /**
   * Initializes all node events.
   *
   * @param settingsButton Setting button konva object.
   */
  private _initNodeEvents(settingsButton: Konva.Group) {
    this.konvaObject.on('click', () => {
      if (this.depTree.draggedEdge) {
        try {
          this.depTree.connectDraggedEdge(this.crytonNode);
        } catch (err) {
          this.depTree.draggedEdge = null;
        }
      }
    });
    this.konvaObject.on('dragmove', () => {
      this.updateEdges();
      this.depTree.treeLayer.batchDraw();
    });
    this.konvaObject.on('dragstart', () => {
      this.konvaObject.moveToTop();
    });
    this.konvaObject.on('mouseenter', () => {
      if (this.depTree.toolState.isSwapEnabled) {
        this.strokeAnimation.activate(this.depTree.theme.primary);
        this.depTree.cursorState.setCursor(Cursor.POINTER);
      } else if (this.depTree.toolState.isDeleteEnabled) {
        this.strokeAnimation.activate(this.depTree.theme.primary);
        this.depTree.cursorState.setCursor(Cursor.POINTER);
      }
    });
    this.konvaObject.on('mouseleave', () => {
      if (this.depTree.toolState.isSwapEnabled || this.depTree.toolState.isDeleteEnabled) {
        this.depTree.cursorState.unsetCursor(Cursor.POINTER);
      }
      if (this.depTree.toolState.isMoveNodeEnabled) {
        this.depTree.cursorState.unsetCursor(Cursor.POINTER);
      }
    });
    settingsButton.on('click', () => {
      this._handleSettingsBtnClick();
    });
  }

  /**
   * Creates node rectangle.
   *
   * @returns Node rectangle
   */
  private _createNodeRect(): Konva.Rect {
    const rect = new Konva.Rect({
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    });

    if (this.depTree.theme) {
      rect.fill(this.depTree.theme.templateCreator.treeNodeRect);
    }

    rect.on('click', () => {
      if (this.depTree.toolState.isSwapEnabled) {
        this.strokeAnimation.deactivate();
        this.depTree.treeNodeManager.moveToDispenser(this.crytonNode);
        this.crytonNode.unattach();
        this.depTree.cursorState.unsetCursor(Cursor.POINTER);
      } else if (this.depTree.toolState.isDeleteEnabled) {
        this.depTree.treeNodeManager.removeCanvasNode(this.crytonNode);
        this.crytonNode.destroy();
        this.depTree.cursorState.unsetCursor(Cursor.POINTER);
      }
    });

    return rect;
  }

  /**
   * Creates a red connector circle.
   */
  private _createNodeConnector(): Konva.Group {
    this._connector = new NodeConnector(NODE_WIDTH, NODE_HEIGHT);
    const konvaObject = this._connector.konvaObject;

    this._connector.rippleAnimation = new RippleAnimation(this._connector.rippleCircle, this.depTree.treeLayer);

    konvaObject.on('mouseenter', () => {
      this.depTree.cursorState.setCursor(Cursor.POINTER);
    });

    konvaObject.on('mouseleave', () => {
      this.depTree.cursorState.unsetCursor(Cursor.POINTER);
      this._connector.unanimateRipple();
    });

    konvaObject.on('click', event => {
      if (this.depTree.draggedEdge || this.depTree.toolState.isDeleteEnabled || this.depTree.toolState.isSwapEnabled) {
        return;
      }
      event.cancelBubble = true;

      this.depTree.clickedNode = this;
      this.depTree.createDraggedEdge(this.crytonNode);
    });
    konvaObject.on('mousedown', () => this._connector.animateRipple(15, 0.2));
    konvaObject.on('mouseup', () => this._connector.unanimateRipple());

    return konvaObject;
  }

  /**
   * Creates text inside the node.
   *
   * @param text Text inside the node.
   * @returns Konva text object.
   */
  private _createText(text: string): Konva.Text {
    const x = 24 + SETTINGS_BTN_PADDING * 2;
    const y = (NODE_HEIGHT - 16) / 2;

    this._nameText = new Konva.Text({
      text: new ShortStringPipe().transform(text, 10),
      fontFamily: 'Roboto',
      fontSize: 16,
      fontStyle: '500',
      fill: 'white',
      listening: false,
      x,
      y
    });

    return this._nameText;
  }
}
