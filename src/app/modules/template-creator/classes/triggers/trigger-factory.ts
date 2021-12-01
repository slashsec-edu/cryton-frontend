import { TriggerType } from '../../models/enums/trigger-type';
import { DeltaArgs } from '../../models/interfaces/delta-args';
import { HTTPListenerArgs } from '../../models/interfaces/http-listener-args';
import { DeltaTrigger } from './delta-trigger';
import { HttpTrigger } from './http-trigger';
import { Trigger } from './trigger';

export class TriggerFactory {
  constructor() {}

  static createTrigger(type: TriggerType, args: Record<string, any>): Trigger<Record<string, any>> {
    switch (type) {
      case TriggerType.DELTA:
        return new DeltaTrigger(args as DeltaArgs);
      case TriggerType.HTTP_LISTENER:
        return new HttpTrigger(args as HTTPListenerArgs);
      default:
        throw new Error('Unknown trigger type.');
    }
  }
}
