import { TriggerType } from '../../models/enums/trigger-type';
import { DateTimeArgs } from '../../models/interfaces/date-time-args';
import { DeltaArgs } from '../../models/interfaces/delta-args';
import { HTTPListenerArgs } from '../../models/interfaces/http-listener-args';
import { DateTimeTrigger } from './date-time-trigger';
import { DeltaTrigger } from './delta-trigger';
import { HttpTrigger } from './http-trigger';
import { Trigger, TriggerArgs } from './trigger';

export class TriggerFactory {
  constructor() {}

  static createTrigger(type: TriggerType, args: TriggerArgs): Trigger<TriggerArgs> {
    switch (type) {
      case TriggerType.DELTA:
        return new DeltaTrigger(args as DeltaArgs);
      case TriggerType.HTTP_LISTENER:
        return new HttpTrigger(args as HTTPListenerArgs);
      case TriggerType.DATE_TIME:
        return new DateTimeTrigger(args as DateTimeArgs);
      default:
        throw new Error('Unknown trigger type.');
    }
  }
}
