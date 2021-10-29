import Konva from 'konva';
import { TriggerType } from '../../../models/enums/trigger-type';

export abstract class Trigger<T extends Record<string, any>> {
  protected _args: T;
  private _type: TriggerType;

  protected abstract _tag: Konva.Text;

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

  getTag(): Konva.Text {
    return this._tag;
  }

  abstract editArgs(triggerArgs: T): void;

  abstract getStartTime(): number;

  abstract setStartTime(startTime: number): void;
}
