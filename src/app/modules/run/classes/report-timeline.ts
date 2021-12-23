import { KonvaEventObject } from 'konva/types/Node';
import { Vector2d } from 'konva/types/types';
import { Subject } from 'rxjs';
import { PlanExecutionReport } from 'src/app/models/api-responses/report/plan-execution-report.interface';
import { StageExecutionReport } from 'src/app/models/api-responses/report/stage-execution-report.interface';
import { StepExecutionReport } from 'src/app/models/api-responses/report/step-execution-report.interface';
import { Timeline } from '../../shared/classes/timeline';
import { TimelineUtils } from '../../shared/classes/timeline-utils';
import { ExecutionBound } from './execution-bound';
import { FILL_MAP } from './report-constants';
import { ReportStageHighlight } from './report-stage-highlight';
import { ReportStageLabel } from './report-stage-label';
import { STEP_HEIGHT, ReportStep } from './report-step';

const STEP_GAP = 10;
const STAGE_GAP = 10;
const STAGE_PADDING = 5;

export interface ExecutionData {
  name: string;
  state: string;
  startTime: string;
  pauseTime: string;
  finishTime: string;
  result?: string;
}

export class ReportTimeline extends Timeline {
  executionData$ = new Subject<ExecutionData>();
  timelineOpenSeconds = Date.now() / 1000;
  timelinePadding: [number, number, number, number] = [30, 0, 10, 130];

  private _steps: ReportStep[] = [];
  private _highlights: ReportStageHighlight[] = [];
  private _labels: ReportStageLabel[] = [];
  private _executionBounds: ExecutionBound[] = [];

  constructor() {
    super(true);
  }

  updateExecution(execution: PlanExecutionReport): void {
    this.executionData$.next(null);
    this.timelineOpenSeconds = Date.now() / 1000;
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

  renderExecution(execution: PlanExecutionReport): void {
    const reportHeight = this.createStages(execution.stage_executions);
    this._setTimeframe(execution.start_time, this._steps);
    this._createExecutionBounds(execution);
    this._centerReport(this.height, reportHeight);
  }

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
      endSeconds = this.timelineOpenSeconds;
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

    stageLabel.on('click', () => {
      this.executionData$.next({
        name: stageReport.stage_name,
        state: stageReport.state,
        startTime: stageReport.start_time,
        pauseTime: stageReport.pause_time,
        finishTime: stageReport.finish_time
      });
      this.moveToX(-highlight.x() + this.timelinePadding[3]);
    });

    this.paddingMask.addMiddleChild(stageLabel);
    this.addElement(highlight);
    highlight.moveToBottom();
    this.stage.draw();
  }

  createStep(stepReport: StepExecutionReport, y: number, stagePauseTime?: string): ReportStep {
    let endSeconds: number;

    if (stepReport.finish_time) {
      endSeconds = TimelineUtils.datetimeToSeconds(stepReport.finish_time);
    } else if (stagePauseTime) {
      endSeconds = TimelineUtils.datetimeToSeconds(stagePauseTime);
    } else {
      endSeconds = this.timelineOpenSeconds;
    }

    const step = new ReportStep({
      theme: this.theme,
      startSeconds: TimelineUtils.datetimeToSeconds(stepReport.start_time),
      endSeconds,
      reportData: stepReport,
      cursorState: this.cursorState,
      y
    });

    step.on('click', () => {
      this.executionData$.next({
        name: stepReport.step_name,
        state: stepReport.state,
        startTime: stepReport.start_time,
        pauseTime: null,
        finishTime: stepReport.finish_time,
        result: stepReport.result
      });
    });

    return step;
  }

  moveToX(x: number): void {
    if (x > this._maxX) {
      x = this._maxX;
    }
    this.stage.x(x);
    this.paddingMask.x(-x);
    this._highlights.forEach(highligh => highligh.x(-x));
    this.tickManager.renderTicks(this.height, this.stageX, this.tickSeconds, this.theme);
  }

  protected _onWheel(e: KonvaEventObject<WheelEvent>): void {
    super._onWheel(e);
    this._moveStageLabels(e.evt.deltaY * 0.2);
    this.paddingMask.draw();
  }

  protected _stageDrag = (pos: Vector2d): Vector2d => {
    const x = pos.x > this._maxX ? this._maxX : pos.x;
    this.paddingMask.x(-pos.x);
    this._highlights.forEach(highligh => highligh.x(-pos.x));

    return { x, y: 0 };
  };

  protected _refreshTheme(): void {
    this._steps.forEach(step => step.changeTheme(this.theme));
    super._refreshTheme();
  }

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

  private _createExecutionBound(startSeconds: number): ExecutionBound {
    return new ExecutionBound({
      startSeconds,
      topY: this.timelinePadding[0] - this.mainLayer.y(),
      bottomY: this.height - this.timelinePadding[2]
    });
  }

  private _centerReport(timelineHeight: number, reportHeight: number): void {
    const centerDist = (timelineHeight - this.timelinePadding[0]) / 2 + this.timelinePadding[0] - reportHeight / 2;

    this.mainLayer.y(centerDist);
    this._moveStageLabels(centerDist);
    this.updateStatic();
    this.stage.draw();
  }

  private _moveStageLabels(dist: number): void {
    this._labels.forEach(label => label.y(label.y() + dist));
  }

  private _setTimeframe(executionStart: string, steps: ReportStep[]): void {
    const startSeconds = new Date(executionStart).getTime();

    this.tickSeconds = this._calcOptimalTickSeconds(steps);
    this.startSeconds = startSeconds / 1000;
  }

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

  private _roundToUnit(num: number, unit: number): number {
    const remainder = num % unit;
    const increment = remainder > unit - remainder ? -remainder : unit - remainder;
    return num + increment;
  }

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
}
