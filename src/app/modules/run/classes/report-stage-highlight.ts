import Konva from 'konva';
import { ShapeConfig } from 'konva/types/Shape';
import { TimelineUtils } from '../../shared/classes/timeline-utils';
import { VerticalLine } from '../../shared/classes/vertical-line';
import { TimelineParams } from '../../shared/models/interfaces/timeline-params.interface';
import { TimelineShape } from '../../shared/models/interfaces/timeline-shape.interface';

const STROKE_WIDTH = 2;
const RECT_OPACITY = 0.2;

export interface HighlightConfig extends ShapeConfig {
  startSeconds: number;
  endSeconds: number;
}

export class ReportStageHighlight extends Konva.Group implements TimelineShape {
  private _rect: Konva.Rect;
  private _startBound: VerticalLine;
  private _endBound: VerticalLine;

  constructor(config: HighlightConfig) {
    super(config);

    this._rect = this._createRect(config);
    this._startBound = this._createBound(config);
    this._endBound = this._createBound(config);

    this.add(this._rect, this._startBound, this._endBound);
  }

  updatePoints(params: TimelineParams): void {
    const { startSeconds, endSeconds } = this.getAttrs() as HighlightConfig;
    const duration = endSeconds - startSeconds;
    const startX = TimelineUtils.calcXFromSeconds(startSeconds, params);
    const width = TimelineUtils.calcWidthFromDuration(duration, params);

    this.x(startX);
    this._rect.width(width);
    this._endBound.x(width);
  }

  private _createRect(config: ShapeConfig): Konva.Rect {
    return new Konva.Rect({
      height: config.height,
      fill: config.fill,
      opacity: RECT_OPACITY,
      listening: false
    });
  }

  private _createBound(config: ShapeConfig): VerticalLine {
    return new VerticalLine({
      topY: 0,
      bottomY: config.height,
      stroke: config.fill,
      strokeWidth: STROKE_WIDTH
    });
  }
}
