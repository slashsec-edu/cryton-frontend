import { TriggerType } from '../../models/enums/trigger-type';
import { DateTimeArgs } from '../../models/interfaces/date-time-args';
import { Trigger } from './trigger';

export class DateTimeTrigger extends Trigger<DateTimeArgs> {
  constructor(args: DateTimeArgs) {
    super(args, TriggerType.DATE_TIME);
  }

  editArgs(triggerArgs: DateTimeArgs): void {
    this._args = Object.assign({}, triggerArgs);
  }

  getStartTime(): number {
    return;
  }

  setStartTime = (): void => {};
}
