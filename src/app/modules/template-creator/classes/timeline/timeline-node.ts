import Konva from 'konva';
import { TemplateTimeline } from './template-timeline';
import { ShortStringPipe } from 'src/app/modules/shared/pipes/short-string.pipe';
import { TimelineEdge } from './timeline-edge';
import {
  NODE_RADIUS,
  LABEL_PADDING,
  LABEL_CORNER_RADIUS,
  LABEL_MARGIN_BOTTOM,
  NAME_FONT_SIZE,
  MAX_NAME_LENGTH,
  NODE_LTICK_TIMEMARK_NAME,
  NODE_LTICK_NAME,
  NODE_CIRCLE_NAME,
  NODE_LABEL_NAME,
  LABEL_TAG_NAME,
  LABEL_TEXT_NAME
} from './timeline-node-constants';
import { Theme } from '../../models/interfaces/theme';
import { Tick } from 'src/app/modules/shared/classes/tick';
import { NodeTimemark } from 'src/app/modules/shared/classes/node-timemark';
import { TimelineUtils } from 'src/app/modules/shared/classes/timeline-utils';
import { CIRCLE_RADIUS } from 'src/app/modules/run/classes/report-step';
import { StageNode, TriggerArgs } from '../dependency-graph/node/stage-node';
import { Trigger } from '../triggers/trigger';

export class TimelineNode {
  graphNode: StageNode;
  konvaObject: Konva.Group;
  selected = false;

  childEdges: TimelineEdge[] = [];
  parentEdges: TimelineEdge[] = [];

  private _leadingTick: Tick;

  // Konva parts
  private _nodeCircle: Konva.Circle;

  // Label
  private _nameLabel: Konva.Label;
  private _nameText: Konva.Text;
  private _nameTag: Konva.Tag;

  get name(): string {
    return this.graphNode.name;
  }

  get trigger(): Trigger<TriggerArgs> {
    return this.graphNode.trigger;
  }

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
    return 2 * NODE_RADIUS + LABEL_MARGIN_BOTTOM + 2 * LABEL_PADDING + NAME_FONT_SIZE;
  }

  get timeline(): TemplateTimeline {
    return this.graphNode.timeline;
  }

  constructor(graphNode: StageNode) {
    this.graphNode = graphNode;
    this._initKonvaObject();
  }

  /**
   * Destroys timeline node.
   */
  destroy(): void {
    this.konvaObject.destroy();
  }

  /**
   * Removes timeline node from the timeline. Node can be used again.
   */
  remove(): void {
    this.konvaObject.remove();
  }

  /**
   * Updates all node properties and properties of connected edges.
   */
  updateNode(): void {
    this.updateX();
  }

  /**
   * Updates the X coordinate.
   */
  updateX(): void {
    this.x = this._calcX();
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
    this._nameLabel.x(-(this._nameLabel.width() / 2));
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
    this._nameLabel = this._createLabel();

    this.konvaObject.add(this._nodeCircle).add(this._nameLabel);
    this.konvaObject.x(this._calcX());
    this.konvaObject.y(this.timeline.stage ? this.timeline.height / 2 : 250);

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
      this.timeline.openNodeParams$.next(this.graphNode);
    });
  }

  /**
   * Updates the leading tick position.
   */
  private _updateLeadingTick(): void {
    if (this._leadingTick) {
      this._leadingTick.x(this.konvaObject.x());
      (this._leadingTick.timeMark() as NodeTimemark).changeX(this.konvaObject.x());

      const timelineParams = this.timeline.getParams();
      this._leadingTick
        .timeMark()
        .recalculate(TimelineUtils.calcSecondsFromX(this.x, timelineParams), timelineParams.tickSeconds < 1);
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
      constantText: this.graphNode.trigger.getStartTime() === null ? 'No start time' : null,
      useCenterCoords: true,
      timemarkY: 0,
      x: this.konvaObject.x(),
      name: NODE_LTICK_TIMEMARK_NAME
    });

    timeMark.centerY(this.timeline.timelinePadding[0]);

    const tick = new Tick({
      topY: this.graphNode.timeline.timelinePadding[0],
      bottomY: this.timeline.height - this.graphNode.timeline.timelinePadding[2],
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
      text: new ShortStringPipe().transform(this.graphNode.name, MAX_NAME_LENGTH),
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
    const triggerStart = this.graphNode.trigger.getStartTime();

    return triggerStart != null
      ? TimelineUtils.calcXFromSeconds(triggerStart, this.timeline.getParams())
      : this.timeline.timelinePadding[3];
  }

  private _forEachEdge(func: (e: TimelineEdge) => void): void {
    this.childEdges.forEach(edge => func(edge));
    this.parentEdges.forEach(edge => func(edge));
  }
}
