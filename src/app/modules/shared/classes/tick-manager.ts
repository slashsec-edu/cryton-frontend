import Konva from 'konva';
import { Theme } from '../../template-creator/models/interfaces/theme';
import { TICK_WIDTH, LTICK_DIST, RECYCLER_RADIUS } from './timeline-constants';
import { TickLinkedList } from '../../template-creator/classes/timeline/tick-linked-list';
import { TimeMark } from './time-mark';
import { Tick } from './tick';
import { TimelineUtils } from './timeline-utils';
import { TimelineParams } from '../models/interfaces/timeline-params.interface';

export class TickManager {
  private _windowSize = 0;
  private _ticks: TickLinkedList;
  private _lastTickIndex: number;
  private _timelineParams: TimelineParams;
  private _useUTC: boolean;
  private _startSeconds = 0;
  private _minIndex = 0;

  private _tickLayer: Konva.Layer;
  private _timeMarkLayer: Konva.Layer;

  private get _firstTickIndex(): number {
    return this._lastTickIndex - this._ticks.length + 1;
  }

  constructor(
    width: number,
    tickLayer: Konva.Layer,
    timeMarkLayer: Konva.Layer,
    timelineParams: TimelineParams,
    useUTC?: boolean
  ) {
    this._tickLayer = tickLayer;
    this._timeMarkLayer = timeMarkLayer;
    this._windowSize = this._calcWindowSize(width);
    this._timelineParams = timelineParams;
    this._useUTC = useUTC;
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
      timeMark?.recalculate(currentIndex * tickSeconds + startSeconds, tickSeconds < 1);
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

    if (this._useUTC) {
      this._minIndex = -Infinity;
    } else {
      this._minIndex = -Math.round(seconds / tickSeconds);
    }
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
    if (this._windowSize === 0) {
      return;
    }

    const firstTick = this._createTick(startIndex, height, tickSeconds, theme);
    this._ticks = new TickLinkedList(firstTick);
    this._tickLayer.add(firstTick);

    for (let i = startIndex + 1; i < startIndex + this._windowSize; i++) {
      const tick = this._createTick(i, height, tickSeconds, theme);
      this._tickLayer.add(tick);
      this._appendTick(tick);
    }

    this._lastTickIndex = startIndex + this._windowSize - 1;
    this._tickLayer.draw();
  }

  /**
   * Renders ticks in the direction of the drag..
   *
   * @param height Canvas height.
   * @param stageX Stage x coordinate.
   * @param tickSeconds How many seconds elapse in one tick.
   * @param theme Current theme.
   */
  renderTicks(height: number, stageX: number, tickSeconds: number, theme: Theme): void {
    const wantedLastIndex = this._calcWantedLastIndex(stageX);

    while (this._lastTickIndex < wantedLastIndex) {
      this._addTick(this._lastTickIndex + 1, height, tickSeconds, theme, true);
    }
    while (this._firstTickIndex > this._minIndex - RECYCLER_RADIUS && this._lastTickIndex > wantedLastIndex) {
      this._addTick(this._firstTickIndex - 1, height, tickSeconds, theme, false);
    }
  }

  /**
   * Recreates ticks.
   *
   * @param width Canvas width
   * @param height Canvas height.
   * @param stageX Stage x coordinate.
   * @param tickSeconds How many seconds elapse in one tick.
   * @param theme Current theme.
   */
  recreateTicks(width: number, height: number, stageX: number, tickSeconds: number, theme: Theme): void {
    this._windowSize = this._calcWindowSize(width);
    const startIndex = this._calcWantedLastIndex(stageX) - this._windowSize + 1;

    this._tickLayer.destroyChildren();
    this._timeMarkLayer.destroyChildren();
    this.createTicks(height, tickSeconds, theme, startIndex);
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
    // Wait for the first RECYCLER_RADIUS ticks to hide.
    const startSecondsWidth = TimelineUtils.calcWidthFromDuration(this._startSeconds, this._timelineParams);
    if (!this._useUTC && -stageX < this._calcTickX(RECYCLER_RADIUS - 1) - startSecondsWidth) {
      const startTicks = Math.round(startSecondsWidth / TICK_WIDTH);
      return this._windowSize - 1 - startTicks;
    }
    return Math.round(
      ((this._windowSize - RECYCLER_RADIUS) * TICK_WIDTH - stageX - this._timelineParams.padding[3]) / TICK_WIDTH
    );
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
    const topPadding = this._timelineParams.padding[0];
    const bottomPadding = this._timelineParams.padding[2];
    const x = this._calcTickX(index);
    let timeMark: TimeMark;

    if (isLeading) {
      timeMark = new TimeMark({
        x,
        theme,
        y: topPadding / 2,
        topPadding,
        totalSeconds: index * tickSeconds + this._startSeconds,
        useCenterCoords: true,
        listening: false,
        useUTC: this._useUTC,
        showMillis: tickSeconds < 1
      });
      this._timeMarkLayer.add(timeMark);
    }

    const tick = new Tick({
      topY: topPadding,
      bottomY: height - bottomPadding,
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
  private _appendTick(tick: Tick): void {
    this._ticks.append(tick);
    this._lastTickIndex++;

    if (this._ticks.length > this._windowSize) {
      this._ticks.destroyHead();
    }
  }

  /**
   * Prepends the tick to the start of the recycler and if there
   * are more ticks than needed, destroys a tick at the end.
   *
   * @param tick Tick to prepend.
   */
  private _prependTick(tick: Tick): void {
    this._ticks.prepend(tick);

    if (this._ticks.length > this._windowSize) {
      this._ticks.destroyTail();
      this._lastTickIndex--;
    }
  }

  /**
   * Calculates number of ticks that should be rendered at every point of time.
   *
   * -Stage X               Canvas end
   * _____|____________________|______
   *
   * |----|--------------------|-----|
   * Rec.      Visible area        Rec.
   *
   * |-------------------------------|
   * Window size
   *
   * @param width Timeline canvas width.
   * @returns Number of ticks that should be rendered at every point of time.
   */
  private _calcWindowSize(width: number): number {
    return Math.ceil(width / TICK_WIDTH) + 2 * RECYCLER_RADIUS;
  }

  /**
   * Calculates X coordinate of tick based on tick index.
   * Factors in left side padding of the timeline.
   *
   * @param index Tick index.
   * @returns X coordinate.
   */
  private _calcTickX(index: number): number {
    return this._timelineParams.padding[3] + index * TICK_WIDTH;
  }
}
