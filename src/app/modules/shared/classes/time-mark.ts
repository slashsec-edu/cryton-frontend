import Konva from 'konva';
import { TextConfig } from 'konva/types/shapes/Text';
import { Theme } from '../../template-creator/models/interfaces/theme';

export interface TimeMarkConfig extends TextConfig {
  totalSeconds: number;
  theme?: Theme;
  constantText?: string;
  useCenterCoords?: boolean;
  useUTC?: boolean;
  showMillis?: boolean;
}

export const TIME_MARK_NAME = 'timeMark';

export class TimeMark extends Konva.Text {
  constructor(config: TimeMarkConfig) {
    super({
      fontSize: config.fontSize ?? 11,
      fontFamily: config.fontFamily ?? 'Roboto',
      listening: config.listening ?? false,
      name: TIME_MARK_NAME,
      ...config
    });

    if (config.theme) {
      this.fill(config.theme.templateCreator.timemarkText);
    }

    this.recalculate(config.totalSeconds, config.showMillis);

    if (config.useCenterCoords) {
      this.x(this.x() - this.width() / 2);
      this.y(this.y() - this.height() / 2);
    }
  }

  /**
   * Calculates time mark text in format HH:MM:SS.
   *
   * @param totalSeconds Time that tick represents in seconds.
   * @param showMillis If true, the timemark will display milliseconds as well.
   */
  recalculate(totalSeconds: number, showMillis: boolean): void {
    const constantText = this.getAttr('constantText') as string;
    const useUTC = this.getAttr('useUTC') as boolean;

    let newText: string;

    this.setAttr('totalSeconds', totalSeconds);
    this.setAttr('showMillis', showMillis);
    if (constantText) {
      newText = constantText;
    } else if (useUTC) {
      newText = this._calcUTC(totalSeconds, showMillis);
    } else {
      newText = this._calcStandard(totalSeconds);
    }

    this.text(newText);
  }

  /**
   * Changes time mark color theme.
   *
   * @param theme Color theme.
   */
  changeTheme(theme: Theme): void {
    this.fill(theme.templateCreator.timemarkText);
  }

  private _calcStandard(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    });
    totalSeconds -= Number(hours) * 3600;
    const minutes = Math.floor(totalSeconds / 60).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    });
    const seconds = (totalSeconds % 60).toLocaleString('en-US', {
      minimumIntegerDigits: 2,
      useGrouping: false
    });

    return `${hours}:${minutes}:${seconds}`;
  }

  private _calcUTC(totalSeconds: number, showMillis: boolean): string {
    const date = new Date(totalSeconds * 1000);

    const day = date.getDate().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
    const month = (date.getMonth() + 1).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
    const year = date.getFullYear().toLocaleString('en-US', { minimumIntegerDigits: 4, useGrouping: false });
    const hours = date.getHours().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
    const minutes = date.getMinutes().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
    const seconds = date.getSeconds().toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false });
    const millis = date.getMilliseconds().toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false });

    return `${day}. ${month}. ${year} - ${hours}:${minutes}:${seconds}` + (showMillis ? `.${millis}` : '');
  }
}
