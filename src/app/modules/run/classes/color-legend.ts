import Konva from 'konva';
import { ShapeConfig } from 'konva/types/Shape';
import { Theme } from '../../template-creator/models/interfaces/theme';

const STATE_GAP = 10;
const STATE_FONT_SIZE = 15;
const CIRCLE_RADIUS = 6;
const CIRCLE_TEXT_GAP = 5;
const LEGEND_MARGIN = 20;
const LEGEND_HPADDING = 15;
const LEGEND_CORNER_RADIUS = 5;
const LEGEND_HEIGHT = 35;

export interface LegendConfig extends ShapeConfig {
  parentHeight: number;
  theme: Theme;
  colorMap: Record<string, string>;
}

export class ColorLegend extends Konva.Group {
  private _bg: Konva.Rect;
  private _stateNames: Konva.Text[] = [];

  constructor(config: LegendConfig) {
    super({
      listening: false
    });

    const statesWidth = this._createStates(config.colorMap, config.theme);
    this._createBG(statesWidth, config.theme);

    this.setAttrs({
      x: LEGEND_MARGIN,
      y: config.parentHeight - LEGEND_HEIGHT - LEGEND_MARGIN
    });
  }

  changeTheme(theme: Theme): void {
    const nameColor = theme.isDark ? 'black' : 'white';
    this._bg.fill(theme.isDark ? 'white' : 'black');
    this._stateNames.forEach(name => name.fill(nameColor));
  }

  private _createStates(colorMap: Record<string, string>, theme: Theme): number {
    let currentX = LEGEND_HPADDING + CIRCLE_RADIUS;

    Object.entries(colorMap).forEach(color => {
      const colorCircle = new Konva.Circle({
        radius: CIRCLE_RADIUS,
        fill: color[1],
        x: currentX,
        y: LEGEND_HEIGHT / 2
      });
      currentX += CIRCLE_RADIUS + CIRCLE_TEXT_GAP;

      const stateName = new Konva.Text({
        text: color[0].toUpperCase(),
        fill: theme.isDark ? 'black' : 'white',
        fontFamily: 'Roboto',
        fontSize: STATE_FONT_SIZE,
        height: LEGEND_HEIGHT + 3,
        verticalAlign: 'middle',
        x: currentX
      });
      currentX += stateName.width() + STATE_GAP + CIRCLE_RADIUS;
      this._stateNames.push(stateName);

      this.add(colorCircle, stateName);
    });

    return currentX - STATE_GAP - CIRCLE_RADIUS;
  }

  private _createBG(legendWidth: number, theme: Theme): void {
    const bg = new Konva.Rect({
      width: legendWidth + 2 * LEGEND_HPADDING,
      height: LEGEND_HEIGHT,
      fill: theme.isDark ? 'white' : 'black',
      cornerRadius: LEGEND_CORNER_RADIUS
    });
    this._bg = bg;
    this.add(bg);
    bg.moveToBottom();
  }
}
