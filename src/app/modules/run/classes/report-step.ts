import Konva from 'konva';
import { ShapeConfig } from 'konva/types/Shape';
import { StepExecutionReport } from 'src/app/models/api-responses/report/step-execution-report.interface';
import { TimelineUtils } from '../../shared/classes/timeline-utils';
import { TimelineParams } from '../../shared/models/interfaces/timeline-params.interface';
import { TimelineShape } from '../../shared/models/interfaces/timeline-shape.interface';
import { Cursor, CursorState } from '../../template-creator/classes/dependency-graph/cursor-state';
import { Theme } from '../../template-creator/models/interfaces/theme';
import { FILL_MAP } from './report-constants';

export const STEP_HEIGHT = 27;
export const CIRCLE_RADIUS = 8;
export const CORNER_RADIUS = 8;
export const FONT_PADDING = 10;
export const HIT_AREA_MIN_WIDTH = 20;
export const MAX_TEXT_LENGTH = 15;

export interface ReportStepConfig extends ShapeConfig {
  reportData: StepExecutionReport;
  cursorState: CursorState;
  startSeconds: number;
  endSeconds: number;
  theme: Theme;
}

/**
 * Represents a step execution inside the report timeline.
 */
export class ReportStep extends Konva.Group implements TimelineShape {
  private _label: Konva.Label;
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
    this.setAttr('theme', theme);
    const labelText = this._getLabelText(this._label);
    const labelTag = this._getLabelTag(this._label);

    if (this._label.getAttr('labelPosition') === 'outer') {
      labelText.fill(theme.isDark ? 'black' : 'white');
      labelTag.fill(theme.isDark ? 'white' : 'black');
    }
  }

  updatePoints(params: TimelineParams): void {
    const { startSeconds } = this.getAttrs() as ReportStepConfig;
    const x = TimelineUtils.calcXFromSeconds(startSeconds, params);
    this.x(x);

    if (this.duration > 0) {
      const newWidth = TimelineUtils.calcWidthFromDuration(this.duration, params);
      this._body.width(newWidth);
      this._adjustLabel(this._label, newWidth, (this.getAttr('theme') as Theme).isDark);
    }
  }

  private _initKonvaObject(config: ReportStepConfig): void {
    const duration = config.endSeconds ? config.endSeconds - config.startSeconds : 0;

    this._body = this._createStepBody(duration, config.reportData.state);
    this._label = this._createLabel(config.reportData.step_name, this._body.width(), config.theme.isDark);
    this.add(this._body, this._label);
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
      y: STEP_HEIGHT / 2,
      hitStrokeWidth: 5
    });
  }

  private _createStepRect(state: string): Konva.Rect {
    const rect = new Konva.Rect({
      fill: FILL_MAP[state.toLocaleLowerCase()],
      cornerRadius: [0, 0, 0, 0].fill(CORNER_RADIUS),
      height: STEP_HEIGHT,
      hitStrokeWidth: 5
    });

    return rect;
  }

  private _createLabel(text: string, containerWidth: number, darkTheme: boolean): Konva.Label {
    const label = new Konva.Label({
      y: STEP_HEIGHT / 2
    });

    const labelText = this._createText(text);
    const labelTag = this._createTag(darkTheme);
    label.add(labelTag);
    label.add(labelText);

    return this._adjustLabel(label, containerWidth, darkTheme);
  }

  private _createTag(darkTheme: boolean): Konva.Tag {
    return new Konva.Tag({
      fill: darkTheme ? 'white' : 'black',
      pointerDirection: 'left',
      pointerHeight: 10,
      pointerWidth: 7,
      cornerRadius: 5,
      lineJoin: 'round'
    });
  }

  private _adjustLabel(label: Konva.Label, containerWidth: number, darkTheme: boolean): Konva.Label {
    if (containerWidth < label.width() + FONT_PADDING) {
      return this._toOuterLabel(label, containerWidth, darkTheme);
    } else {
      return this._toInnerLabel(label);
    }
  }

  private _toInnerLabel(label: Konva.Label): Konva.Label {
    label.setAttrs({
      x: 0,
      labelPosition: 'inner'
    });
    this._getLabelText(label).fill('white');
    this._getLabelTag(label).fill(null);

    return label;
  }

  private _toOuterLabel(label: Konva.Label, bodyWidth: number, darkTheme: boolean): Konva.Label {
    label.setAttrs({
      x: bodyWidth,
      labelPosition: 'outer'
    });
    this._getLabelText(label).fill(darkTheme ? 'black' : 'white');
    this._getLabelTag(label).fill(darkTheme ? 'white' : 'black');

    return label;
  }

  private _createText(text: string): Konva.Text {
    let labelText = text;

    if (text.length > MAX_TEXT_LENGTH) {
      labelText = text.slice(0, MAX_TEXT_LENGTH) + '...';
    }

    return new Konva.Text({
      fontSize: 12,
      fontFamily: 'Roboto, Sans Serif, Arial',
      text: labelText,
      verticalAlign: 'middle',
      align: 'left',
      height: 20,
      ellipsis: true,
      wrap: 'none',
      padding: FONT_PADDING
    });
  }

  private _getLabelText(label: Konva.Label): Konva.Text {
    return label.findOne('Text');
  }

  private _getLabelTag(label: Konva.Label): Konva.Tag {
    return label.findOne('Tag');
  }
}
