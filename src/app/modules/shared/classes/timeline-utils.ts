import { TimelineParams } from '../models/interfaces/timeline-shape.interface';
import { TICK_WIDTH } from './timeline-constants';

export class TimelineUtils {
  constructor() {}

  static datetimeToSeconds(datetime: string): number {
    if (!datetime) {
      return null;
    }
    return new Date(datetime).getTime() / 1000;
  }

  static calcXFromSeconds(seconds: number, params: TimelineParams): number {
    return ((seconds - params.secondsAtZero) / params.tickSeconds) * TICK_WIDTH + params.leftPadding;
  }

  static calcSecondsFromX(x: number, params: TimelineParams): number {
    return ((x - params.leftPadding) / TICK_WIDTH) * params.tickSeconds + params.secondsAtZero;
  }

  static calcWidthFromDuration(duration: number, params: TimelineParams): number {
    return (duration / params.tickSeconds) * TICK_WIDTH;
  }
}
