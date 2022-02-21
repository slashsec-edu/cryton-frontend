import { TriggerType } from '../../models/enums/trigger-type';
import { HTTPListenerArgs } from '../../models/interfaces/http-listener-args';
import { Trigger } from './trigger';

export class HttpTrigger extends Trigger<HTTPListenerArgs> {
  constructor(args: HTTPListenerArgs) {
    super(args, TriggerType.HTTP_LISTENER);
  }

  editArgs(args: HTTPListenerArgs): void {
    this._args = args;
  }

  getStartTime(): number {
    return;
  }

  setStartTime = (): void => {};
}
