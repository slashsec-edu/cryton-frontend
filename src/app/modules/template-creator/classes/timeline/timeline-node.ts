import Konva from 'konva';
import { TemplateTimeline } from './template-timeline';
import { ShortStringPipe } from 'src/app/modules/shared/pipes/short-string.pipe';
import { CrytonStage } from '../cryton-node/cryton-stage';
import { TimelineEdge } from './timeline-edge';
import {
  NODE_RADIUS,
  LABEL_PADDING,
  LABEL_CORNER_RADIUS,
  LABEL_MARGIN_BOTTOM,
  NAME_FONT_SIZE,
  MAX_NAME_LENGTH,
  NS_NODE_DIST,
  NODE_LTICK_TIMEMARK_NAME,
  NODE_LTICK_NAME,
  NODE_CIRCLE_NAME,
  NODE_LABEL_NAME,
  LABEL_TAG_NAME,
  LABEL_TEXT_NAME,
  TRIGGER_TAG_NAME
} from './timeline-node-constants';
import { Theme } from '../../models/interfaces/theme';
import { Tick } from 'src/app/modules/shared/classes/tick';
import { NodeTimemark } from 'src/app/modules/shared/classes/node-timemark';
import { TimelineUtils } from 'src/app/modules/shared/classes/timeline-utils';
import { CIRCLE_RADIUS } from 'src/app/modules/report/classes/report-step';

export class TimelineNode {
  crytonNode: CrytonStage;
  konvaObject: Konva.Group;
  selected = false;

  private _leadingTick: Tick;

  // Konva parts
  private _nodeCircle: Konva.Circle;
  private _nameText: Konva.Text;
  private _nameTag: Konva.Tag;
  private _triggerTag: Konva.Text;

  get x(): number {
    return this.konvaObject.x();
  }
  set x(value: number) {
    this.konvaObject.x(value);
    this.updateEdges();
    this.timeline.mainLayer.draw();
  }

  get y(): number {
    return this.konvaObject.y();
  }
  set y(value: number) {
    this.konvaObject.y(value);
    this.updateEdges();
    this.timeline.mainLayer.draw();
  }

  get fullNodeHeight(): number {
    return 2 * NODE_RADIUS + LABEL_MARGIN_BOTTOM + 2 * LABEL_PADDING[0] + NAME_FONT_SIZE;
  }

  get childEdges(): TimelineEdge[] {
    return this.crytonNode.childEdges.map(edge => edge.timelineEdge);
  }

  get parentEdges(): TimelineEdge[] {
    return this.crytonNode.parentEdges.map(edge => edge.timelineEdge);
  }

  get timeline(): TemplateTimeline {
    return this.crytonNode.timeline;
  }

  constructor(crytonNode: CrytonStage) {
    this.crytonNode = crytonNode;
    this._initKonvaObject();
  }

  /**
   * Checks if new trigger start is correct.
   *
   * @param triggerStart New trigger start in seconds.
   * @returns True if trigger start is correct.
   */
  checkTriggerStart(triggerStart: number): void {
    if (!triggerStart) {
      return;
    }

    let nearestParentStart = -Infinity;
    let nearestChildStart = Infinity;

    this.childEdges.forEach(edge => {
      const childTriggerStart = edge.childNode.crytonNode.trigger.getStartTime();

      if (childTriggerStart && childTriggerStart < nearestChildStart) {
        nearestChildStart = childTriggerStart;
      }
    });
    this.parentEdges.forEach(edge => {
      const parentTriggerStart = edge.parentNode.crytonNode.trigger.getStartTime();

      if (parentTriggerStart && parentTriggerStart > nearestParentStart) {
        nearestParentStart = parentTriggerStart;
      }
    });

    if (triggerStart <= nearestParentStart || triggerStart >= nearestChildStart) {
      throw new Error(
        'Invalid trigger start time. Trigger must start after every parent stage and before every child stage trigger.'
      );
    }
  }

  /**
   * Updates all node properties and properties of connected edges.
   */
  updateNode(): void {
    this.updateX();
    this.updateTriggerTag();
    this.updateEdgesStyle();
  }

  /**
   * Updates the X coordinate.
   */
  updateX(): void {
    this.x = this._calcX();
  }

  /**
   * Updates trigger tag.
   */
  updateTriggerTag(): void {
    this._triggerTag?.destroy();
    this._renderTriggerTag();
    this.timeline.mainLayer.draw();
  }

  /**
   * Updates style of all connected edges.
   */
  updateEdgesStyle(): void {
    this._forEachEdge(edge => edge.updateEdgeStyle());
    this.timeline.mainLayer.draw();
  }

  /**
   * Updates points of each parent and child node.
   */
  updateEdges(): void {
    this._forEachEdge(edge => edge.updatePoints());
    this.timeline.stage?.draw();
  }

  /**
   * Draws the plan layer (nodes and edges).
   */
  drawPlan(): void {
    this.timeline.mainLayer.draw();
  }

  /**
   * Highligts the node and sets it as selected.
   */
  select(): void {
    this.timeline.selectedNodes.add(this);
    this._nodeCircle.strokeWidth(3);
    this._nodeCircle.stroke(this.timeline.theme.accent);
    this.konvaObject.moveToTop();
    this.selected = true;
  }

  /**
   * Removes node highlight and unsets it at selected.
   */
  deselect(): void {
    this.timeline.selectedNodes.delete(this);
    this._nodeCircle.strokeWidth(0);
    this._nodeCircle.stroke('');
    this.selected = false;
  }

  /**
   * Removes a given edge from the child edges array.
   *
   * @param edge Edge to remove.
   */
  removeChildEdge(edge: TimelineEdge): void {
    this._removeEdge(this.childEdges, edge);
  }

  /**
   * Removes a given edge from the parent edges array.
   *
   * @param edge Edge to remove.
   */
  removeParentEdge(edge: TimelineEdge): void {
    this._removeEdge(this.parentEdges, edge);
  }

  /**
   * Changes node name and updates tag dimensions.
   *
   * @param name New name.
   */
  changeName(name: string): void {
    this._nameText?.text(new ShortStringPipe().transform(name, 10));
    this._nameText.x(-(this._nameText.width() / 2));

    this._nameTag.x(-(this._nameTag.width() / 2));
  }

  changeTheme(theme: Theme): void {
    this._nodeCircle.fill(theme.primary);

    if (this._nodeCircle.strokeWidth() > 0) {
      this._nodeCircle.stroke(theme.accent);
    }

    this._nameText.fill(theme.templateCreator.timemarkText);
    this._nameTag.fill(theme.templateCreator.labelBG);
  }

  /**
   * Helper function for removing an edge from an array.
   *
   * @param edgeArray Array to remove from.
   * @param edge Edge to remove.
   */
  private _removeEdge(edgeArray: TimelineEdge[], edge: TimelineEdge): void {
    const edgeIndex = edgeArray.indexOf(edge);

    if (edgeIndex !== -1) {
      edgeArray.splice(edgeIndex, 1);
    }
  }

  /**
   * Creates a shift + click event for selection and deselection of a node.
   */
  private _initNodeSelectEvent(): void {
    this._nodeCircle.on('click', e => {
      if (e.evt.shiftKey) {
        if (this.timeline.selectedNodes.has(this)) {
          this.deselect();
        } else {
          this.select();
        }
      }
    });
  }

  /**
   * Adds all konva objects to the main konva group and sets configuration attributes.
   */
  private _initKonvaObject() {
    this._initKonvaGroup();

    this._nodeCircle = this._createNodeCircle();
    const label = this._createLabel();

    this.konvaObject.add(this._nodeCircle).add(label);
    this.konvaObject.x(TimelineUtils.calcXFromSeconds(this._calcX(), this.timeline.getParams()));
    this.konvaObject.y(this.timeline.stage ? this.timeline.height / 2 : 250);

    this._renderTriggerTag();
    this._initNodeSelectEvent();
  }

  /**
   * Creates the main konva group and initializes events on it.
   */
  private _initKonvaGroup(): void {
    this.konvaObject = new Konva.Group({
      draggable: true
    });
    this.konvaObject.dragBoundFunc(pos => this.timeline.nodeMover.nodeDragFunc(this, pos));

    this.konvaObject.on('dragstart', () => {
      if (!this.timeline.toolState.isVerticalMoveEnabled) {
        this._createLeadingTick();
      }
    });
    this.konvaObject.on('dragmove', () => {
      this.updateEdges();
      this._updateLeadingTick();
      this.konvaObject.moveToTop();
    });
    this.konvaObject.on('dragend', () => {
      if (this._leadingTick) {
        this._leadingTick.timeMark().destroy();
        this._leadingTick.destroy();
        this._leadingTick = null;
        this.timeline.stage.draw();
      }
    });
    this.konvaObject.on('dblclick', () => {
      this.timeline.openNodeParams$.next(this.crytonNode);
    });
  }

  /**
   * Updates the leading tick position.
   */
  private _updateLeadingTick(): void {
    if (this._leadingTick) {
      this._leadingTick.x(this.konvaObject.x());
      (this._leadingTick.timeMark() as NodeTimemark).changeX(this.konvaObject.x());
      this._leadingTick.timeMark().recalculate(TimelineUtils.calcSecondsFromX(this.x, this.timeline.getParams()));
      this.timeline.stage.draw();
    }
  }

  /**
   * Creates the leading tick which shows current delta when dragging a node.
   */
  private _createLeadingTick(): void {
    const timeMark = new NodeTimemark({
      totalSeconds: TimelineUtils.calcSecondsFromX(this.x, this.timeline.getParams()),
      theme: this.timeline.theme,
      constantText: this.crytonNode.trigger.getStartTime() === null ? 'No start time' : null,
      useCenterCoords: true,
      timemarkY: 0,
      x: this.konvaObject.x(),
      name: NODE_LTICK_TIMEMARK_NAME
    });

    timeMark.centerY(this.timeline.timelinePadding[0]);

    const tick = new Tick({
      topY: this.crytonNode.timeline.timelinePadding[0],
      bottomY: this.timeline.height - this.crytonNode.timeline.timelinePadding[2],
      x: this.konvaObject.x(),
      theme: this.timeline.theme,
      isLeading: true,
      strokeWidth: 2,
      listening: false,
      timeMark,
      name: NODE_LTICK_NAME
    });

    this._leadingTick = tick;

    this.timeline.tickLayer.add(tick);
    this.timeline.timeMarkLayer.add(timeMark);
    timeMark.moveToTop();
    this.timeline.stage.draw();
  }

  /**
   * Creates the konva node circle.
   *
   * @returns Konva circle.
   */
  private _createNodeCircle(): Konva.Circle {
    const circle = new Konva.Circle({
      name: NODE_CIRCLE_NAME,
      radius: NODE_RADIUS,
      strokeWidth: 0
    });

    if (this.timeline.theme) {
      circle.fill(this.timeline.theme.primary);
    }

    circle.on('click', e => {
      e.cancelBubble = true;
    });

    return circle;
  }

  /**
   * Creates the label for the timeline node.
   *
   * @returns Konva label.
   */
  private _createLabel(): Konva.Label {
    const label = new Konva.Label({ listening: false, name: NODE_LABEL_NAME });
    this._nameTag = this._createNameTag();
    this._nameText = this._createNameText();

    label.add(this._nameTag).add(this._nameText);
    label.x(-label.width() / 2);
    label.y(-CIRCLE_RADIUS - label.height() - 2 * LABEL_PADDING - LABEL_MARGIN_BOTTOM);

    return label;
  }

  /**
   * Creates the background rect of the name tag.
   *
   * @returns Konva rect forming the name tag background.
   */
  private _createNameTag(): Konva.Tag {
    const nameTag = new Konva.Tag({
      cornerRadius: LABEL_CORNER_RADIUS,
      listening: false,
      name: LABEL_TAG_NAME
    });

    if (this.timeline.theme) {
      nameTag.fill(this.timeline.theme.templateCreator.labelBG);
    }

    return nameTag;
  }

  /**
   * Creates the name text inside the node name tag.
   *
   * @returns Konva text representing the node name text.
   */
  private _createNameText(): Konva.Text {
    const nameText = new Konva.Text({
      text: new ShortStringPipe().transform(this.crytonNode.name, MAX_NAME_LENGTH),
      fontFamily: 'roboto',
      fontSize: NAME_FONT_SIZE,
      y: -NODE_RADIUS - NAME_FONT_SIZE - LABEL_MARGIN_BOTTOM,
      padding: 5,
      listening: false,
      name: LABEL_TEXT_NAME
    });

    if (this.timeline.theme) {
      nameText.fill(this.timeline.theme.templateCreator.timemarkText);
    }

    nameText.x(-(nameText.width() / 2));
    return nameText;
  }

  /**
   * Calculates X coordinate where node should be placed.
   *
   * @returns X coordinate.
   */
  private _calcX(): number {
    const triggerStart = this.crytonNode.trigger.getStartTime();

    return triggerStart != null
      ? TimelineUtils.calcXFromSeconds(triggerStart, this.timeline.getParams())
      : this._calcNoStartX();
  }

  /**
   * Calculates X coordinate for nodes without defined start time inside trigger.
   *
   * Nodes with trigger which doesn't define a start time (HTTPListener for example)
   * have to be placed at a constant distance from their closest parent node.
   *
   * If the node doesn't have a parent, it gets placed to the start of the timeline.
   *
   * @returns X coordinate where the node should be placed.
   */
  private _calcNoStartX(): number {
    if (this.parentEdges.length > 0) {
      const greatestX = Math.max(...this.parentEdges.map(edge => edge.parentNode.x)) - this.timeline.timelinePadding[3];
      return greatestX + NS_NODE_DIST;
    }

    return this.timeline.timelinePadding[3];
  }

  /**
   * Renders tag defined by stage trigger inside the node circle if it exists.
   */
  private _renderTriggerTag(): void {
    this._triggerTag = this.crytonNode.trigger.getTag();

    if (this._triggerTag) {
      this._triggerTag.setAttrs({
        x: -this._triggerTag.width() / 2,
        y: -this._triggerTag.height() / 2,
        name: TRIGGER_TAG_NAME
      });
      this.konvaObject.add(this._triggerTag);
      this._triggerTag.moveToTop();
    }
  }

  private _forEachEdge(func: (e: TimelineEdge) => void): void {
    this.childEdges.forEach(edge => func(edge));
    this.parentEdges.forEach(edge => func(edge));
  }
}
