import Konva from 'konva';
import { DependencyTree } from '../dependency-tree';
import { ShortStringPipe } from '../../../../shared/pipes/short-string.pipe';
import { StrokeAnimation } from '../../../animations/stroke.animation';
import { Cursor } from '../cursor-state';
import { NodeConnector } from '../node-connector';
import { SettingsButton, SETTINGS_BTN_PADDING } from '../settings-button';
import { TreeEdge } from '../edge/tree-edge';
import { Theme } from '../../../models/interfaces/theme';
import { CANVAS_PADDING } from '../dependency-tree-constants';

export const NODE_WIDTH = 170;
export const NODE_HEIGHT = 40;
export const TREE_NODE_NAME = 'treeNode';
export const TREE_NODE_RECT_NAME = 'treeNodeRect';
export const TREE_NODE_TEXT_NAME = 'treeNodeName';

export class TreeNode {
  name: string;
  childEdges: TreeEdge[] = [];
  parentEdges: TreeEdge[] = [];

  parentDepTree: DependencyTree;
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

  constructor(name: string) {
    this.name = name;
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
    this.name = name;
    this._nameText?.text(new ShortStringPipe().transform(name, 10));
  }

  changeTheme(theme: Theme): void {
    this._nodeRect.fill(theme.templateCreator.treeNodeRect);
    this._connector.changeTheme(theme);
  }

  addParentEdge(edge: TreeEdge): void {
    this.parentEdges.push(edge);
  }

  addChildEdge(edge: TreeEdge): void {
    this.childEdges.push(edge);
  }

  removeParentEdge(edge: TreeEdge): void {
    this._removeEdge(this.parentEdges, edge);
  }

  removeChildEdge(edge: TreeEdge): void {
    this._removeEdge(this.childEdges, edge);
  }

  /**
   * Destroys all edges.
   */
  destroyEdges(): void {
    [...this.parentEdges].forEach(edge => edge.destroy());
    [...this.childEdges].forEach(edge => edge.destroy());
  }

  /**
   * Destroys node.
   */
  destroy(): void {
    this.destroyEdges();
    this.konvaObject.destroy();
  }

  /**
   * Unattaches node from the dependency tree.
   * Node can still be reattached.
   */
  unattach(): void {
    this.destroyEdges();
    this.konvaObject.remove();
  }

  setParentDepTree(depTree: DependencyTree): void {
    this.parentDepTree = depTree;

    if (depTree) {
      this._initKonvaObject();
    }
  }

  protected _onSettingsClick(): void {
    this.parentDepTree.treeNodeManager.editNode(this);
  }

  /**
   * Navigates to correct tab and initializes editing.
   */
  private _handleSettingsBtnClick() {
    this._onSettingsClick();
  }

  /**
   * Initializes node konva object.
   */
  private _initKonvaObject(): void {
    this.konvaObject = new Konva.Group({ name: TREE_NODE_NAME });
    this._nodeRect = this._createNodeRect();
    const settingsButton = new SettingsButton(this.parentDepTree, NODE_HEIGHT).konvaObject;
    const connector = this._createNodeConnector();
    const name = this._createText(this.name);

    this._initNodePosition();
    this._initNodeEvents(settingsButton);

    this.strokeAnimation = new StrokeAnimation(this._nodeRect, this.konvaObject, this.parentDepTree.treeLayer);

    this.konvaObject.add(this._nodeRect);
    this.konvaObject.add(settingsButton);
    this.konvaObject.add(connector);
    this.konvaObject.add(name);
  }

  /**
   * Initializes node position.
   */
  private _initNodePosition() {
    const stageX = this.parentDepTree?.stageX ?? 0;
    const stageY = this.parentDepTree?.stageY ?? 0;

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
      if (this.parentDepTree && this.parentDepTree.draggedEdge) {
        try {
          this.parentDepTree.connectDraggedEdge(this);
        } catch (err) {
          this.parentDepTree.draggedEdge = null;
        }
      }
    });
    this.konvaObject.on('dragmove', () => {
      this.updateEdges();
      this.parentDepTree.treeLayer.batchDraw();
    });
    this.konvaObject.on('dragstart', () => {
      this.konvaObject.moveToTop();
    });
    this.konvaObject.on('mouseenter', () => {
      if (this.parentDepTree.toolState.isSwapEnabled) {
        this.strokeAnimation.activate(this.parentDepTree.theme.primary);
        this.parentDepTree.cursorState.setCursor(Cursor.POINTER);
      } else if (this.parentDepTree.toolState.isDeleteEnabled) {
        this.strokeAnimation.activate(this.parentDepTree.theme.primary);
        this.parentDepTree.cursorState.setCursor(Cursor.POINTER);
      } else if (this.parentDepTree.toolState.isMoveNodeEnabled) {
        this.parentDepTree.cursorState.setCursor(Cursor.GRAB);
      }
    });
    this.konvaObject.on('mouseleave', () => {
      if (this.parentDepTree.toolState.isSwapEnabled || this.parentDepTree.toolState.isDeleteEnabled) {
        this.parentDepTree.cursorState.unsetCursor(Cursor.POINTER);
      }
      if (this.parentDepTree.toolState.isMoveNodeEnabled) {
        this.parentDepTree.cursorState.unsetCursor(Cursor.GRAB);
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
      height: NODE_HEIGHT,
      name: TREE_NODE_RECT_NAME
    });

    if (this.parentDepTree && this.parentDepTree.theme) {
      rect.fill(this.parentDepTree.theme.templateCreator.treeNodeRect);
    }

    rect.on('click', () => {
      if (this.parentDepTree.toolState.isSwapEnabled) {
        this.strokeAnimation.deactivate();
        this.parentDepTree.cursorState.resetCursor();
        this.unattach();
        this.parentDepTree.treeNodeManager.moveToDispenser(this);
      } else if (this.parentDepTree.toolState.isDeleteEnabled) {
        this.parentDepTree.treeNodeManager.clearEditNode();
        this.parentDepTree.cursorState.resetCursor();
        this.destroy();
        this.parentDepTree.treeNodeManager.removeNode(this);
      }
    });

    return rect;
  }

  /**
   * Creates a red connector circle.
   */
  private _createNodeConnector(): Konva.Group {
    this._connector = new NodeConnector(NODE_WIDTH, NODE_HEIGHT, this);

    if (this.parentDepTree && this.parentDepTree.theme) {
      this._connector.changeTheme(this.parentDepTree.theme);
    }
    return this._connector.konvaObject;
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
      name: TREE_NODE_TEXT_NAME,
      x,
      y
    });

    return this._nameText;
  }

  /**
   * Removes edge from the edge array.
   *
   * @param edgeArray Array of edges to remove from.
   * @param edge Edge to remove.
   */
  private _removeEdge(edgeArray: TreeEdge[], edge: TreeEdge): void {
    const edgeIndex = edgeArray.indexOf(edge);

    if (edgeIndex !== -1) {
      edgeArray.splice(edgeIndex, 1);
    }
  }
}
