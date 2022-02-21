import { TriggerType } from '../../models/enums/trigger-type';
import { DateTimeArgs } from '../../models/interfaces/date-time-args';
import { DeltaArgs } from '../../models/interfaces/delta-args';
import { HTTPListenerArgs } from '../../models/interfaces/http-listener-args';

export type TriggerArgs = DeltaArgs | HTTPListenerArgs | DateTimeArgs;

export abstract class Trigger<T extends TriggerArgs> {
  protected _args: T;
  private _type: TriggerType;

  constructor(args: T, type: TriggerType) {
    this.editArgs(args);
    this._type = type;
  }

  getType(): TriggerType {
    return this._type;
  }

  getArgs(): T {
    return this._args;
  }

  abstract editArgs(triggerArgs: T): void;

  abstract getStartTime(): number;

  abstract setStartTime(startTime: number): void;
}
