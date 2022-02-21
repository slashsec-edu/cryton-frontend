import { TriggerType } from '../../models/enums/trigger-type';
import { DeltaArgs } from '../../models/interfaces/delta-args';
import { Trigger } from './trigger';

export class DeltaTrigger extends Trigger<DeltaArgs> {
  constructor(args: DeltaArgs) {
    super(args, TriggerType.DELTA);
  }

  static calcSecondsFromDelta(delta: DeltaArgs): number {
    return delta.seconds + delta.minutes * 60 + delta.hours * 3600;
  }

  static calcDeltaFromSeconds(seconds: number): DeltaArgs {
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    return {
      hours,
      minutes,
      seconds
    };
  }

  /**
   * Edits delta trigger arguments.
   * No argument should be left undefined.
   *
   * @param args Delta arguments.
   */
  editArgs(args: DeltaArgs): void {
    const { hours, minutes, seconds } = args;

    this._args = {
      hours: hours ?? 0,
      minutes: minutes ?? 0,
      seconds: seconds ?? 0
    };
  }

  getStartTime(): number {
    return DeltaTrigger.calcSecondsFromDelta(this._args);
  }

  setStartTime(startTime: number): void {
    this._args = DeltaTrigger.calcDeltaFromSeconds(startTime);
  }
}
