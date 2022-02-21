import { KonvaEventObject } from 'konva/types/Node';
import { Vector2d } from 'konva/types/types';
import { Subject } from 'rxjs';
import { PlanExecutionReport } from 'src/app/models/api-responses/report/plan-execution-report.interface';
import { StageExecutionReport } from 'src/app/models/api-responses/report/stage-execution-report.interface';
import { StepExecutionReport } from 'src/app/models/api-responses/report/step-execution-report.interface';
import { Timeline } from '../../shared/classes/timeline';
import { TimelineUtils } from '../../shared/classes/timeline-utils';
import { NodeType } from '../../template-creator/models/enums/node-type';
import { ExecutionBound } from './execution-bound';
import { FILL_MAP } from './report-constants';
import { ReportStageHighlight } from './report-stage-highlight';
import { ReportStageLabel } from './report-stage-label';
import { ReportStep, STEP_HEIGHT } from './report-step';

// Vertical space between steps.
const STEP_GAP = 10;

// Vertical space between stages.
const STAGE_GAP = 10;

// Vertical padding inside the stage.
const STAGE_PADDING = 5;

// Minimal distance of tooltip from an edge.
const MIN_TOOLTIP_DIST = 200;

// Types describing tooltip position.
type VerticalTooltipPos = 'top' | 'middle' | 'bottom';
type HorizontalTooltipPos = 'left' | 'middle' | 'right';
type TooltipPos = [HorizontalTooltipPos, VerticalTooltipPos];

export interface TooltipData {
  x: number;
  y: number;
  verticalPos: VerticalTooltipPos;
  horizontalPos: HorizontalTooltipPos;
  nodeType: NodeType;
  data: StageExecutionReport | StepExecutionReport;
}

export class ReportTimeline extends Timeline {
  // Emits data for the tooltip for stage / step detail.
  displayTooltip$ = new Subject<TooltipData | undefined>();

  // Time when user opened / refreshed the timeline.
  currentTime = Date.now() / 1000;

  // Timeline padding (top, right, bottom, left).
  timelinePadding: [number, number, number, number] = [30, 0, 10, 130];

  // Array of steps displayed inside the timeline.
  private _steps: ReportStep[] = [];

  // Array of stage highlights inside the timeline.
  private _highlights: ReportStageHighlight[] = [];

  // Array of stage labels inside the timeline.
  private _labels: ReportStageLabel[] = [];

  // Execution start / finish time bounds.
  private _executionBounds: ExecutionBound[] = [];

  constructor() {
    super(true);
  }

  /**
   * Destroys current execution data and loads updated execution into the timeline.
   *
   * @param execution Plan execution report.
   */
  updateExecution(execution: PlanExecutionReport): void {
    this.displayTooltip$.next(null);
    this.currentTime = Date.now() / 1000;
    this.mainLayer.destroyChildren();
    this.paddingMask.destroyMiddleChildren();
    this._steps = [];
    this._highlights = [];
    this._labels = [];
    this._executionBounds = [];
    this.removeAllElements();

    this.createStages(execution.stage_executions);
    this._createExecutionBounds(execution);
  }

  /**
   * Updates canvas dimensions.
   */
  updateDimensions(): void {
    if (!this.stage) {
      return;
    }

    super.updateDimensions();
    this._highlights.forEach(highlight => highlight.width(this.width));
    this._executionBounds.forEach(bound => {
      bound.setTop(this.timelinePadding[0]);
      bound.setBottom(this.height - this.timelinePadding[2]);
    });
    this.stage.draw();
  }

  /**
   * Renders execution inside the timeline.
   *
   * @param execution Plan execution report.
   */
  renderExecution(execution: PlanExecutionReport): void {
    const reportHeight = this.createStages(execution.stage_executions);
    this._setTimeframe(execution.start_time, this._steps);
    this._createExecutionBounds(execution);
    this._centerReport(this.height, reportHeight);
  }

  /**
   * Creates stages of the report. Starts with creating steps and then creates the stage highlight and label based on height of steps.
   *
   * @param stageReports Array of stage reports.
   * @returns Total height of displayed stages.
   */
  createStages(stageReports: StageExecutionReport[]): number {
    let currentY = 0;
    let stageTop = 0;

    stageReports.forEach(stageReport => {
      stageTop = currentY;

      const sortedSteps = stageReport.step_executions
        .filter(stepReport => stepReport.start_time)
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

      sortedSteps.forEach(stepReport => {
        const step = this.createStep(stepReport, currentY, stageReport.pause_time);
        this._steps.push(step);
        this.addElement(step);
        currentY += STEP_GAP + STEP_HEIGHT;
      });

      if (sortedSteps.length > 0) {
        this.createStage(stageReport, stageTop, currentY);
      }

      currentY += STAGE_GAP;
    });

    return currentY !== 0 ? currentY - STAGE_GAP : currentY;
  }

  /**
   * Creates a stage highlight and label starting at the top coordinate.
   *
   * @param stageReport Stage execution report.
   * @param top Top coordinate.
   * @param bottom Bottom coordinate.
   */
  createStage(stageReport: StageExecutionReport, top: number, bottom: number): void {
    const y = top - STAGE_PADDING;
    const height = bottom - top - STEP_GAP + 2 * STAGE_PADDING;
    const stateColor = FILL_MAP[stageReport.state.toLocaleLowerCase()];
    const startSeconds = TimelineUtils.datetimeToSeconds(stageReport.start_time);
    let endSeconds: number;

    if (stageReport.finish_time) {
      endSeconds = TimelineUtils.datetimeToSeconds(stageReport.finish_time);
    } else if (stageReport.pause_time) {
      endSeconds = TimelineUtils.datetimeToSeconds(stageReport.pause_time);
    } else {
      endSeconds = this.currentTime;
    }

    const highlight = new ReportStageHighlight({
      startSeconds,
      endSeconds,
      y,
      height,
      fill: stateColor
    });

    const stageLabel = new ReportStageLabel({
      y: y + this.mainLayer.y(),
      height,
      width: this.timelinePadding[3],
      fill: stateColor,
      text: stageReport.stage_name,
      cursorState: this.cursorState,
      opacity: 0.9
    });
    this._labels.push(stageLabel);

    stageLabel.on('click', e => {
      e.cancelBubble = true;

      if (e.evt.ctrlKey) {
        this.moveToX(-highlight.x() + this.timelinePadding[3]);
      } else {
        const tooltipPos = this._calcTooltipPosition(e.evt.offsetX, e.evt.offsetY, ['right', 'middle']);

        this.displayTooltip$.next({
          x: e.evt.offsetX,
          y: e.evt.offsetY,
          horizontalPos: tooltipPos[0],
          verticalPos: tooltipPos[1],
          nodeType: NodeType.CRYTON_STAGE,
          data: stageReport
        });
      }
    });

    this.paddingMask.addMiddleChild(stageLabel);
    this.addElement(highlight);
    highlight.moveToBottom();
    this.stage.draw();
  }

  /**
   * Creates a step at the y coordinate.
   *
   * @param stepReport Stage execution report.
   * @param y Y coordinate.
   * @param stagePauseTime Optional pause time of stage that it belongs to.
   * @returns Report step object.
   */
  createStep(stepReport: StepExecutionReport, y: number, stagePauseTime?: string): ReportStep {
    let endSeconds: number;

    if (stepReport.finish_time) {
      endSeconds = TimelineUtils.datetimeToSeconds(stepReport.finish_time);
    } else if (stagePauseTime) {
      endSeconds = TimelineUtils.datetimeToSeconds(stagePauseTime);
    } else {
      endSeconds = this.currentTime;
    }

    const step = new ReportStep({
      theme: this.theme,
      startSeconds: TimelineUtils.datetimeToSeconds(stepReport.start_time),
      endSeconds,
      reportData: stepReport,
      cursorState: this.cursorState,
      y
    });

    step.on('click', e => {
      e.cancelBubble = true;
      const tooltipPos = this._calcTooltipPosition(e.evt.offsetX, e.evt.offsetY, ['middle', 'top']);

      this.displayTooltip$.next({
        x: e.evt.offsetX,
        y: e.evt.offsetY,
        horizontalPos: tooltipPos[0],
        verticalPos: tooltipPos[1],
        nodeType: NodeType.CRYTON_STEP,
        data: stepReport
      });
    });

    return step;
  }

  /**
   * Moves the timeline to a given x coordinate.
   *
   * @param x X coordinate.
   */
  moveToX(x: number): void {
    if (x > this._maxX) {
      x = this._maxX;
    }
    this.stage.x(x);
    this.paddingMask.x(-x);
    this._highlights.forEach(highligh => highligh.x(-x));
    this.tickManager.renderTicks(this.height, this.stageX, this.tickSeconds, this.theme);
  }

  /**
   * Initializes additional stage events for closing tooltip.
   *
   * @param container Canvas container.
   */
  protected _createStage(container: HTMLDivElement): void {
    super._createStage(container);
    this.stage.on('dragstart click', () => this.displayTooltip$.next(undefined));
  }

  /**
   * Moves stage labels to correct position, closes the tooltip if open and redraws the padding mask.
   *
   * @param e Konva wheel event.
   */
  protected _onWheel(e: KonvaEventObject<WheelEvent>): void {
    super._onWheel(e);
    this._moveStageLabels(e.evt.deltaY * 0.2);
    this.displayTooltip$.next(undefined);
    this.paddingMask.draw();
  }

  /**
   * Moves padding mask and stage highlights to correct position, prevents moving timeline past max. x coordinate.
   *
   * @param pos Drag vector.
   * @returns New position.
   */
  protected _stageDrag = (pos: Vector2d): Vector2d => {
    const x = pos.x > this._maxX ? this._maxX : pos.x;
    this.paddingMask.x(-pos.x);
    this._highlights.forEach(highligh => highligh.x(-pos.x));

    return { x, y: 0 };
  };

  /**
   * Refresh function for timeline theme.
   */
  protected _refreshTheme(): void {
    this._steps.forEach(step => step.changeTheme(this.theme));
    super._refreshTheme();
  }

  /**
   * Creates execution start / finish time bounds.
   *
   * @param execution Plan execution report.
   */
  private _createExecutionBounds(execution: PlanExecutionReport): void {
    if (execution.start_time) {
      const startBound = this._createExecutionBound(TimelineUtils.datetimeToSeconds(execution.start_time));
      this.addElement(startBound, true);
      this._executionBounds.push(startBound);
      startBound.moveToBottom();
    }
    if (execution.finish_time) {
      const finishBound = this._createExecutionBound(TimelineUtils.datetimeToSeconds(execution.finish_time));
      this.addElement(finishBound, true);
      this._executionBounds.push(finishBound);
      finishBound.moveToBottom();
    }
  }

  /**
   * Creates a single execution bound at given seconds.
   *
   * @param seconds Start seconds of execution bound.
   * @returns Execution bound object.
   */
  private _createExecutionBound(seconds: number): ExecutionBound {
    return new ExecutionBound({
      startSeconds: seconds,
      topY: this.timelinePadding[0] - this.mainLayer.y(),
      bottomY: this.height - this.timelinePadding[2]
    });
  }

  /**
   * Centers the report based on timeline and report height.
   *
   * @param timelineHeight Timeline height.
   * @param reportHeight Report height.
   */
  private _centerReport(timelineHeight: number, reportHeight: number): void {
    const centerDist = (timelineHeight - this.timelinePadding[0]) / 2 + this.timelinePadding[0] - reportHeight / 2;

    this.mainLayer.y(centerDist);
    this._moveStageLabels(centerDist);
    this.updateStatic();
    this.stage.draw();
  }

  /**
   * Moves all stage labels on y axis by a given distance.
   *
   * @param dist Distance on the y axis.
   */
  private _moveStageLabels(dist: number): void {
    this._labels.forEach(label => label.y(label.y() + dist));
  }

  /**
   * Sets timeline's tick and start seconds.
   *
   * @param executionStart Execution start time.
   * @param steps Report steps displayed inside the timeline.
   */
  private _setTimeframe(executionStart: string, steps: ReportStep[]): void {
    const startSeconds = new Date(executionStart).getTime();

    this.tickSeconds = this._calcOptimalTickSeconds(steps);
    this.startSeconds = startSeconds / 1000;
  }

  /**
   * Calculates optimal tick seconds based on step durations.
   *
   * @param steps Displayed steps.
   * @returns Optimal tick seconds.
   */
  private _calcOptimalTickSeconds(steps: ReportStep[]): number {
    const durationMedian = this._calcDurationMedian(steps);
    let tickSeconds = durationMedian / 5;

    if (tickSeconds > 3600) {
      tickSeconds = this._roundToUnit(tickSeconds, 3600);
    } else if (tickSeconds > 60) {
      tickSeconds = this._roundToUnit(tickSeconds, 60);
    } else if (tickSeconds > 1) {
      tickSeconds = this._roundToUnit(tickSeconds, 1);
    } else {
      tickSeconds = this._roundToUnit(tickSeconds, 0.001);
    }

    return tickSeconds > 0 ? tickSeconds : 1;
  }

  /**
   * Rounds a number by the unit.
   *
   * @param num Number to round.
   * @param unit Unit to round to.
   * @returns Rounded number.
   */
  private _roundToUnit(num: number, unit: number): number {
    const remainder = num % unit;
    const increment = remainder > unit - remainder ? -remainder : unit - remainder;
    return num + increment;
  }

  /**
   * Calculates a median of step durations.
   *
   * @param steps Report steps.
   * @returns Median of step durations.
   */
  private _calcDurationMedian(steps: ReportStep[]): number {
    if (!steps || steps.length === 0) {
      return 0;
    }
    const sorted = steps.map(step => step.duration).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }

  /**
   * Caluculates best tooltip position to fit the tooltip inside the stage.
   *
   * @param offsetX X position of tooltip (where user clicked).
   * @param offsetY Y position of tooltip (where user clicked).
   * @param defaultPosition Default position to return if tooltip isn't close to no edge.
   * @returns Tuple in format [horizontal position, vertial position].
   */
  private _calcTooltipPosition(offsetX: number, offsetY: number, defaultPosition: TooltipPos): TooltipPos {
    const closeToLeft = offsetX < MIN_TOOLTIP_DIST;
    const closeToRight = this.width - offsetX < MIN_TOOLTIP_DIST;
    const closeToTop = offsetY < MIN_TOOLTIP_DIST;
    const closeToBottom = this.height - offsetY < MIN_TOOLTIP_DIST;

    const horizontalPos = closeToLeft ? 'right' : closeToRight ? 'left' : 'middle';
    const verticalPos = closeToTop ? 'bottom' : closeToBottom ? 'top' : 'middle';

    if (horizontalPos === 'middle' && verticalPos === 'middle') {
      return defaultPosition;
    }
    return [horizontalPos, verticalPos];
  }
}
