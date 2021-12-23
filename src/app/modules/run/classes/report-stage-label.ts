import Konva from 'konva';
import { ShapeConfig } from 'konva/types/Shape';
import { Cursor, CursorState } from '../../template-creator/classes/dependency-graph/cursor-state';

export interface StageLabelConfig extends ShapeConfig {
  text: string;
  cursorState: CursorState;
}

export class ReportStageLabel extends Konva.Group {
  constructor(config: StageLabelConfig) {
    super(config);
    this._initKonvaObject(config);
    this._initKonvaEvents(config.cursorState);
  }

  private _initKonvaObject(config: StageLabelConfig): void {
    this.add(this._createLabelRect(config));
    this.add(this._createLabelText(config));
  }

  private _initKonvaEvents(cursorState: CursorState): void {
    this.on('mouseenter', () => cursorState.setCursor(Cursor.POINTER));
    this.on('mouseleave', () => cursorState.unsetCursor(Cursor.POINTER));
  }

  private _createLabelRect(config: StageLabelConfig): Konva.Rect {
    return new Konva.Rect({
      width: config.width,
      height: config.height,
      fill: config.fill
    });
  }

  private _createLabelText(config: StageLabelConfig): Konva.Text {
    return new Konva.Text({
      text: config.text,
      width: config.width,
      height: config.height,
      align: 'center',
      verticalAlign: 'middle',
      fontFamily: 'Roboto, Sans Serif, Arial',
      fontSize: 14,
      fill: 'white',
      padding: 8,
      ellipsis: true
    });
  }
}
