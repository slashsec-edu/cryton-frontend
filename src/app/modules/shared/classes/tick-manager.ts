import Konva from 'konva';
import { Theme } from '../../template-creator/models/interfaces/theme';
import { TICK_WIDTH, RECYCLER_RADIUS } from './timeline-constants';
import { TickLinkedList } from '../../template-creator/classes/timeline/tick-linked-list';
import { TimeMark } from './time-mark';
import { Tick } from './tick';

/**
 * How far from each other the leading ticks are.
 */
const LTICK_DIST = 10;

export class TickManager {
  windowSize = 0;

  private _ticks: TickLinkedList;
  private _lastTickIndex: number;
  private _timelinePadding: number[];
  private _useUTC: boolean;
  private _startSeconds = 0;
  private _minIndex = 0;

  private _tickLayer: Konva.Layer;
  private _timeMarkLayer: Konva.Layer;

  private get _firstTickIndex(): number {
    return this._lastTickIndex - this.windowSize;
  }

  constructor(
    tickLayer: Konva.Layer,
    timeMarkLayer: Konva.Layer,
    windowSize: number,
    timelinePadding: number[],
    useUTC?: boolean
  ) {
    this._tickLayer = tickLayer;
    this._timeMarkLayer = timeMarkLayer;
    this._timelinePadding = timelinePadding;
    this._useUTC = useUTC;
    this.windowSize = windowSize;
  }

  /**
   * Recalculates the time mark texts based on new seconds per tick.
   *
   * @param tickSeconds How many seconds elapse during one tick.
   * @param startSeconds Seconds at the first index.
   */
  recalculateTimeMarks(tickSeconds: number, startSeconds: number): void {
    let currentTick = this._ticks.head;
    let currentIndex = this._firstTickIndex;

    while (currentTick) {
      const timeMark = currentTick.value.getAttr('timeMark') as TimeMark;
      timeMark?.recalculate(currentIndex * tickSeconds + startSeconds);
      currentTick = currentTick.next;
      currentIndex++;
    }
  }

  /**
   * Updates fill color of all ticks based on theme.
   *
   * @param theme New color theme.
   */
  changeTheme(theme: Theme): void {
    let currentNode = this._ticks.head;

    while (currentNode) {
      const tick = currentNode.value;
      tick.stroke(tick.getAttr('isLeading') ? theme.templateCreator.leadingTick : theme.templateCreator.tick);
      (tick.getAttr('timeMark') as TimeMark)?.changeTheme(theme);
      currentNode = currentNode.next;
    }
  }

  changeStartSeconds(seconds: number, tickSeconds: number): void {
    this._startSeconds = seconds;
    this._minIndex -= Math.round(seconds / tickSeconds);
  }

  /**
   * Creates ticks and appends them to the layer.
   *
   * @param height Canvas height.
   * @param tickSeconds How many seconds elapse in one tick.
   * @param theme Current theme.
   * @param startIndex Index of the first tick to be created.
   */
  createTicks(height: number, tickSeconds: number, theme: Theme, startIndex = 0): void {
    const firstTick = this._createTick(startIndex, height, tickSeconds, theme);
    this._ticks = new TickLinkedList(firstTick);
    this._tickLayer.add(firstTick);

    for (let i = startIndex + 1; i < startIndex + this.windowSize; i++) {
      const tick = this._createTick(i, height, tickSeconds, theme);
      this._tickLayer.add(tick);
      this._appendTick(tick);
    }

    this._lastTickIndex = startIndex + this.windowSize;
    this._tickLayer.draw();
  }

  /**
   * Renders a single tick in the direction of drag.
   *
   * @param height Canvas height.
   * @param stageX Stage x coordinate.
   * @param tickSeconds How many seconds elapse in one tick.
   * @param theme Current theme.
   */
  renderTick(height: number, stageX: number, tickSeconds: number, theme: Theme): void {
    const wantedLastIndex = this._calcWantedLastIndex(stageX);

    while (this._lastTickIndex < wantedLastIndex) {
      this._addTick(this._lastTickIndex, height, tickSeconds, theme, true);
    }
    while (this._lastTickIndex > wantedLastIndex) {
      this._addTick(this._firstTickIndex - 1, height, tickSeconds, theme, false);
    }
  }

  /**
   * Recreates ticks after window resize.
   *
   * @param height Canvas height.
   * @param stageX Stage x coordinate.
   * @param tickSeconds How many seconds elapse in one tick.
   * @param theme Current theme.
   */
  handleWindowResize(height: number, stageX: number, tickSeconds: number, theme: Theme): void {
    const maxX = this.windowSize * TICK_WIDTH - RECYCLER_RADIUS - stageX;
    const startIndex = Math.floor(maxX / TICK_WIDTH) - this.windowSize;

    this._tickLayer.destroyChildren();
    this._timeMarkLayer.destroyChildren();
    this.createTicks(height, tickSeconds, theme, startIndex < this._minIndex ? this._minIndex : startIndex);
  }

  /**
   * Creates a tick and adds it to a correct position.
   *
   * @param index Tick index (total index, not in _ticks array).
   * @param height Canvas height.
   * @param tickSeconds How many seconds elapse in one tick.
   * @param theme Current theme.
   * @param append If true, tick will be appended to the ticks array, else it will be prepended.
   */
  private _addTick(index: number, height: number, tickSeconds: number, theme: Theme, append: boolean): void {
    if (index < this._minIndex) {
      return;
    }

    const tick = this._createTick(index, height, tickSeconds, theme);

    this._tickLayer.add(tick);
    this._tickLayer.batchDraw();
    this._timeMarkLayer.batchDraw();

    if (append) {
      this._appendTick(tick);
    } else {
      this._prependTick(tick);
    }
  }

  /**
   * Calculates what index should the last tick have according to current stage x position.
   *
   * @param stageX Stage x coordinate.
   * @returns Wanted index of the last tick.
   */
  private _calcWantedLastIndex(stageX: number): number {
    const maxX = this.windowSize * TICK_WIDTH - RECYCLER_RADIUS - stageX;
    return Math.ceil(maxX / TICK_WIDTH);
  }

  /**
   * Creates a Konva Line representing a timeline tick.
   * Every n-th tick (n = LTICK_DIST) is leading which means that it has darker stroke
   * and a time mark.
   *
   * @param index Tick index.
   * @param height Canvas height.
   * @param tickSeconds How many seconds elapse in one tick.
   * @param theme Current theme.
   * @returns Tick.
   */
  private _createTick(index: number, height: number, tickSeconds: number, theme: Theme): Tick {
    const isLeading = index % LTICK_DIST === 0;
    const x = this._timelinePadding[3] + index * TICK_WIDTH;
    let timeMark: TimeMark;

    if (isLeading) {
      timeMark = new TimeMark({
        x,
        theme,
        y: this._timelinePadding[0] / 2,
        topPadding: this._timelinePadding[0],
        totalSeconds: index * tickSeconds + this._startSeconds,
        useCenterCoords: true,
        listening: false,
        useUTC: this._useUTC
      });
      this._timeMarkLayer.add(timeMark);
    }

    const tick = new Tick({
      topY: this._timelinePadding[0],
      bottomY: height - this._timelinePadding[2],
      x,
      isLeading,
      theme,
      timeMark
    });

    return tick;
  }

  /**
   * Appends the tick to the end of the recycler and if there
   * are more ticks than needed, destroys a tick at the beginning.
   *
   * @param tick Tick to append.
   */
  private _appendTick(tick: Konva.Line): void {
    this._ticks.append(tick);
    this._lastTickIndex++;

    if (this._ticks.length > this.windowSize) {
      this._ticks.destroyHead();
    }
  }

  /**
   * Prepends the tick to the start of the recycler and if there
   * are more ticks than needed, destroys a tick at the end.
   *
   * @param tick Tick to prepend.
   */
  private _prependTick(tick: Konva.Line): void {
    this._ticks.prepend(tick);

    if (this._ticks.length > this.windowSize) {
      this._ticks.destroyTail();
      this._lastTickIndex--;
    }
  }
}
