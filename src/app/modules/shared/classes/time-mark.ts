import Konva from 'konva';
import { TextConfig } from 'konva/types/shapes/Text';
import { Theme } from '../../template-creator/models/interfaces/theme';
import { CrytonDatetimePipe } from '../pipes/cryton-datetime.pipe';

export interface TimeMarkConfig extends TextConfig {
  totalSeconds: number;
  theme?: Theme;
  constantText?: string;
  useCenterCoords?: boolean;
  useUTC?: boolean;
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

    this.recalculate(config.totalSeconds);

    if (config.useCenterCoords) {
      this.x(this.x() - this.width() / 2);
      this.y(this.y() - this.height() / 2);
    }
  }

  /**
   * Calculates time mark text in format HH:MM:SS.
   *
   * @param totalSeconds Time that tick represents in seconds.
   */
  recalculate(totalSeconds: number): void {
    const constantText = this.getAttr('constantText') as string;
    const useUTC = this.getAttr('useUTC') as boolean;

    let newText: string;

    this.setAttr('totalSeconds', totalSeconds);
    if (constantText) {
      newText = constantText;
    } else if (useUTC) {
      newText = this._calcUTC(totalSeconds);
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

  private _calcUTC(totalSeconds: number): string {
    const date = new Date(totalSeconds * 1000);
    const datePipe = new CrytonDatetimePipe();
    return datePipe.transform(date.toString());
  }
}
