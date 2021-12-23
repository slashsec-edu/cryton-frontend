import { KonvaWrapper } from '../../template-creator/classes/konva/konva-wrapper';
import Konva from 'konva';
import { Vector2d } from 'konva/types/types';
import { KonvaEventObject } from 'konva/types/Node';
import { TickManager } from './tick-manager';
import { PaddingMask } from './padding-mask';
import { TimelineShape } from '../models/interfaces/timeline-shape.interface';
import { TimelineParams } from '../models/interfaces/timeline-params.interface';
import { TimelineUtils } from './timeline-utils';

export class Timeline extends KonvaWrapper {
  // Konva layers
  mainLayer = new Konva.Layer();
  tickLayer = new Konva.Layer({ listening: false });
  paddingMask: PaddingMask;
  timeMarkLayer = new Konva.Layer({ listening: false });
  tickManager: TickManager;

  // Indexes: top, right, bottom, left
  timelinePadding: [number, number, number, number] = [30, 0, 10, 30];

  protected _maxX = 0;
  protected _useUTC: boolean;
  private _invisibleSidePadding: boolean;
  private _tickSeconds = 300;
  private _startSeconds = 0;
  private _elements: (Konva.Shape | TimelineShape)[] = [];
  private _verticallyStatic: Konva.Shape[] = [];
  private _horizontallyStatic: Konva.Shape[] = [];

  get x(): number {
    return this.stage.x();
  }

  set x(value: number) {
    this.stage.x(value);
    this.paddingMask.x(-value);
  }

  get tickSeconds(): number {
    return this._tickSeconds;
  }

  set tickSeconds(value: number) {
    if (value > 0) {
      this._tickSeconds = value;
      this._handleTickSecondsChange();
    }
  }

  get startSeconds(): number {
    return this._startSeconds;
  }

  set startSeconds(value: number) {
    this._startSeconds = value;
    this._maxX += TimelineUtils.calcWidthFromDuration(this._startSeconds, this.getParams());
    this.tickManager.changeStartSeconds(value, this.tickSeconds);
    this.tickManager.recreateTicks(this.width, this.height, this.stageX, this.tickSeconds, this.theme);
    this.stage.draw();
  }

  constructor(useUTC = false, invisibleSidePadding = false) {
    super();
    this._useUTC = useUTC;
    this._invisibleSidePadding = invisibleSidePadding;
  }

  /**
   * Updates canvas dimensions based on window dimensions.
   */
  updateDimensions(): void {
    if (!this.stage) {
      return;
    }

    super.updateDimensions();
    this.paddingMask.updateDimensions(this.width, this.height);
    this.tickManager.recreateTicks(this.width, this.height, this.stageX, this.tickSeconds, this.theme);
    this.stage.draw();
  }

  /**
   * Adds element to the main layer of the timeline.
   * Elements added by this method will be automatically resized and moved
   * on tick size change.
   * Elements must extend Konva.Shape and implement TimelineShape interface.
   *
   * @param element Element to add.
   * @param verticallyStatic If true, element will always stay in the same vertical position.
   * @param horizontallyStatic If true, element will always stay in the same horizontal position.
   */
  addElement(element: TimelineShape | Konva.Shape, verticallyStatic = false, horizontallyStatic = false): void {
    this._elements.push(element);

    if (verticallyStatic) {
      this._verticallyStatic.push(element as Konva.Shape);
    }
    if (horizontallyStatic) {
      this._horizontallyStatic.push(element as Konva.Shape);
    }

    (element as TimelineShape).updatePoints(this.getParams());
    this.mainLayer.add(element as Konva.Shape);
  }

  /**
   * Removes an element from the timeline.
   *
   * @param element Element to remove.
   * @param verticallyStatic Set to true if element is vertically static.
   * @param horizontallyStatic Set to true if element is horizontally static.
   */
  removeElement(element: TimelineShape | Konva.Shape, verticallyStatic = false, horizontallyStatic = false): void {
    this._elements = this._elements.filter(currentElement => currentElement !== element);

    if (verticallyStatic) {
      this._verticallyStatic = this._verticallyStatic.filter(currentElement => currentElement !== element);
    }
    if (horizontallyStatic) {
      this._horizontallyStatic = this._horizontallyStatic.filter(currentElement => currentElement !== element);
    }

    (element as Konva.Shape).remove();
  }

  removeAllElements(): void {
    this._elements.forEach(element => (element as Konva.Shape).remove());

    this._elements = [];
    this._horizontallyStatic = [];
    this._verticallyStatic = [];
  }

  getParams(): TimelineParams {
    return {
      secondsAtZero: this.startSeconds,
      tickSeconds: this.tickSeconds,
      padding: this.timelinePadding
    };
  }

  updateStatic(): void {
    this._verticallyStatic.forEach(shape => shape.y(-this.mainLayer.y()));
    this._horizontallyStatic.forEach(shape => shape.x(-this.mainLayer.x()));
  }

  protected _handleTickSecondsChange(): void {
    this.tickManager.recalculateTimeMarks(this._tickSeconds, this.startSeconds);
    this._updateElements();
    this.stage.draw();
  }

  /**
   * Refreshes timeline color theme.
   */
  protected _refreshTheme(): void {
    this.tickManager.changeTheme(this.theme);
    this.paddingMask.changeTheme(this.theme);
    this.stage.container().style.background = this.theme.templateCreator.background;

    this.stage.draw();
  }

  /**
   * Creates the main Konva stage with ticks inside the container.
   *
   * @param container Container element.
   */
  protected _createStage(container: HTMLDivElement): void {
    const { width, height } = this._getBoundingRect(container);

    this.stage = new Konva.Stage({
      container,
      width,
      height,
      draggable: true,
      dragBoundFunc: this._stageDrag
    });

    this._initKonvaEvents();
    this.paddingMask = new PaddingMask({
      timelineWidth: width,
      timelineHeight: height,
      timelinePadding: this.timelinePadding,
      invisibleSidePadding: this._invisibleSidePadding
    });

    this.stage.add(this.tickLayer).add(this.mainLayer).add(this.paddingMask).add(this.timeMarkLayer);

    this.tickManager = new TickManager(this.width, this.tickLayer, this.timeMarkLayer, this.getParams(), this._useUTC);
    this.tickManager.createTicks(height, this._tickSeconds, this.theme);
  }

  /**
   * Initializes konva stage events.
   */
  protected _initKonvaEvents(): void {
    this.stage.on('dragmove', () =>
      this.tickManager.renderTicks(this.height, this.stageX, this.tickSeconds, this.theme)
    );

    this.stage.on('wheel', (e: KonvaEventObject<WheelEvent>) => {
      this._onWheel(e);
    });
  }

  protected _onWheel(e: KonvaEventObject<WheelEvent>): void {
    const y = this.mainLayer.y() + e.evt.deltaY * 0.2;

    this.mainLayer.y(y);
    this._verticallyStatic.forEach(shape => shape.y(-y));

    this.mainLayer.draw();
  }

  /**
   * Drag function for stage, prevents moving stage vertically.
   *
   * @param pos Position where the stage would be if it moved normally.
   * @returns Position where it will actually be moved.
   */
  protected _stageDrag = (pos: Vector2d): Vector2d => {
    const x = this._useUTC || pos.x < this._maxX ? pos.x : this._maxX;

    this.paddingMask.x(-x);
    this._horizontallyStatic.forEach(shape => shape.x(-x));

    return {
      x,
      y: 0
    };
  };

  private _updateElements(): void {
    this._elements.forEach((el: TimelineShape) => el.updatePoints(this.getParams()));
  }
}
