import Konva from 'konva';
import { LT_FONT_SIZE, LT_PADDING } from '../../template-creator/classes/timeline/timeline-node-constants';
import { Theme } from '../../template-creator/models/interfaces/theme';
import { TimeMark, TimeMarkConfig } from './time-mark';

export class NodeTimemark extends Konva.Group {
  private _timeMark: TimeMark;
  private _timeMarkBG: Konva.Rect;

  constructor(config: TimeMarkConfig) {
    super({
      totalSeconds: undefined,
      theme: undefined,
      constantText: undefined,
      useCenterCoords: undefined,
      listening: false,
      ...config
    });

    this._timeMark = new TimeMark({
      x: LT_PADDING[1],
      y: LT_PADDING[0],
      totalSeconds: config.totalSeconds,
      theme: config.theme,
      fontSize: LT_FONT_SIZE,
      fontFamily: 'Roboto',
      fill: 'white',
      listening: false,
      constantText: config.constantText
    });

    this._timeMarkBG = new Konva.Rect({
      width: this._timeMark.width() + LT_PADDING[1] * 2,
      height: LT_FONT_SIZE + LT_PADDING[0] * 2,
      fill: config.theme.templateCreator.labelBG,
      cornerRadius: 5,
      listening: false
    });

    this.x(config.useCenterCoords ? config.x - this._timeMarkBG.width() / 2 : config.x);
    this.add(this._timeMarkBG).add(this._timeMark);
  }

  centerY(containerHeight: number): void {
    this.y((containerHeight - this._timeMarkBG.height()) / 2);
  }

  changeX(x: number): void {
    this.x(this.getAttr('useCenterCoords') ? x - this._timeMarkBG.width() / 2 : x);
  }

  recalculate(totalSeconds: number): void {
    this.setAttr('totalSeconds', totalSeconds);
    this._timeMark.recalculate(totalSeconds);
  }

  changeTheme(theme: Theme): void {
    this._timeMark.changeTheme(theme);
    this._timeMarkBG.fill(theme.templateCreator.labelBG);
  }
}
