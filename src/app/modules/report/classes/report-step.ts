import Konva from 'konva';
import { ShapeConfig } from 'konva/types/Shape';
import { StepExecutionReport } from 'src/app/models/api-responses/report/step-execution-report.interface';
import { TimelineUtils } from '../../shared/classes/timeline-utils';
import { TimelineParams } from '../../shared/models/interfaces/timeline-params.interface';
import { TimelineShape } from '../../shared/models/interfaces/timeline-shape.interface';
import { Cursor, CursorState } from '../../template-creator/classes/dependency-tree/cursor-state';
import { Theme } from '../../template-creator/models/interfaces/theme';
import { FILL_MAP } from './report-constants';

export const STEP_HEIGHT = 27;
export const CIRCLE_RADIUS = 8;
export const CORNER_RADIUS = 8;
export const FONT_PADDING = 10;
export const HIT_AREA_MIN_WIDTH = 20;
export const MAX_LABEL_WIDTH = 150;

export interface ReportStepConfig extends ShapeConfig {
  reportData: StepExecutionReport;
  cursorState: CursorState;
  theme: Theme;
}

/**
 * Represents a step execution inside the report timeline.
 */
export class ReportStep extends Konva.Group implements TimelineShape {
  private _labelText: Konva.Text;
  private _body: Konva.Rect | Konva.Circle;

  get duration(): number {
    const startSeconds = this.getAttr('startSeconds') as number;
    const endSeconds = this.getAttr('endSeconds') as number;

    if (!startSeconds || !endSeconds) {
      return 0;
    }
    return endSeconds - startSeconds;
  }

  constructor(config: ReportStepConfig) {
    super(config);

    this._initKonvaObject(config);
    this._initKonvaEvents(config.cursorState);
  }

  /**
   * Calculates step duration in seconds.
   *
   * @param step Step execution report data.
   * @returns Step duration.
   */
  static calcStepDuration(step: StepExecutionReport): number {
    if (!step.start_time || !step.finish_time) {
      return 0;
    }

    const startSeconds = new Date(step.start_time).getTime() / 1000;
    const endSeconds = new Date(step.finish_time).getTime() / 1000;
    return endSeconds - startSeconds;
  }

  /**
   * Changes step theme.
   *
   * @param theme New theme.
   */
  changeTheme(theme: Theme): void {
    if (this.duration === 0) {
      this._labelText.fill(theme.isDark ? 'white' : 'black');
    }
  }

  updatePoints(params: TimelineParams): void {
    const { startSeconds } = this.getAttrs() as ReportStepConfig;
    const x = TimelineUtils.calcXFromSeconds(startSeconds, params);
    this.x(x);

    if (this.duration > 0) {
      const newWidth = TimelineUtils.calcWidthFromDuration(this.duration, params);
      this._body.width(newWidth);
      this._labelText.width(newWidth);
    }

    if (this._body.width() < HIT_AREA_MIN_WIDTH) {
      this._body.hitStrokeWidth(5);
    }
  }

  private _initKonvaObject(config: ReportStepConfig): void {
    const duration = config.endSeconds ? config.endSeconds - config.startSeconds : 0;

    this._body = this._createStepBody(duration, config.reportData.state);
    this._labelText = this._createStepText(
      config.reportData.step_name,
      this._body.width(),
      duration,
      config.theme.isDark
    );
    this.add(this._body, this._labelText);
  }

  private _initKonvaEvents(cursorState: CursorState): void {
    this.on('mouseenter', () => cursorState.setCursor(Cursor.POINTER));
    this.on('mouseleave', () => cursorState.unsetCursor(Cursor.POINTER));
  }

  private _createStepBody(duration: number, state: string): Konva.Rect | Konva.Circle {
    if (duration > 0) {
      return this._createStepRect(state);
    } else {
      return this._createStepCircle(state);
    }
  }

  private _createStepCircle(state: string): Konva.Circle {
    return new Konva.Circle({
      radius: CIRCLE_RADIUS,
      fill: FILL_MAP[state.toLocaleLowerCase()],
      y: STEP_HEIGHT / 2
    });
  }

  private _createStepRect(state: string): Konva.Rect {
    const rect = new Konva.Rect({
      fill: FILL_MAP[state.toLocaleLowerCase()],
      cornerRadius: [0, 0, 0, 0].fill(CORNER_RADIUS),
      height: STEP_HEIGHT
    });

    return rect;
  }

  private _createStepText(text: string, containerWidth: number, duration: number, darkTheme: boolean): Konva.Text {
    if (duration === 0) {
      return this._createCircleText(text, containerWidth, darkTheme);
    } else {
      return this._createRectText(text);
    }
  }

  private _createRectText(text: string): Konva.Text {
    const konvaText = this._createText(text);

    konvaText.setAttrs({
      padding: FONT_PADDING,
      fill: 'white'
    });

    return konvaText;
  }

  private _createCircleText(text: string, circleDiameter: number, darkTheme: boolean): Konva.Text {
    const konvaText = this._createText(text);

    konvaText.setAttrs({
      x: circleDiameter,
      fill: darkTheme ? 'white' : 'black'
    });

    return konvaText;
  }

  private _createText(text: string): Konva.Text {
    return new Konva.Text({
      fontSize: 14,
      fontFamily: 'Roboto, Sans Serif, Arial',
      text,
      verticalAlign: 'middle',
      align: 'left',
      height: STEP_HEIGHT,
      width: MAX_LABEL_WIDTH,
      ellipsis: true,
      wrap: 'none'
    });
  }
}
