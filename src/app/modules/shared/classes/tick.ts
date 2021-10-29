import { Theme } from '../../template-creator/models/interfaces/theme';
import { NodeTimemark } from './node-timemark';
import { TimeMark } from './time-mark';
import { VerticalLine, VLineConfig } from './vertical-line';

type TimeMarkType = TimeMark | NodeTimemark;

export interface TickConfig extends VLineConfig {
  isLeading: boolean;
  theme: Theme;
  timeMark?: TimeMarkType;
}

export class Tick extends VerticalLine {
  constructor(config: TickConfig) {
    super({
      timeMark: config.timeMark,
      ...config
    });

    if (config.theme) {
      this.stroke(config.isLeading ? config.theme.templateCreator.leadingTick : config.theme.templateCreator.tick);
    }
  }

  timeMark(value?: TimeMarkType): TimeMarkType {
    if (value) {
      this.setAttr('timeMark', value);
    }
    return this.getAttr('timeMark') as TimeMarkType;
  }
}
