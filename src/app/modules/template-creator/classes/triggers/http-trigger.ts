import Konva from 'konva';
import { TriggerType } from '../../models/enums/trigger-type';
import { HTTPListenerArgs } from '../../models/interfaces/http-listener-args';
import { LABEL_FONT_SIZE } from '../timeline/timeline-node-constants';
import { Trigger } from './trigger';

export class HttpTrigger extends Trigger<HTTPListenerArgs> {
  protected _tag = new Konva.Text({
    fontFamily: 'Roboto',
    fontSize: LABEL_FONT_SIZE,
    fill: 'white',
    text: 'HTTP',
    listening: false
  });

  constructor(args: HTTPListenerArgs) {
    super(args, TriggerType.HTTP_LISTENER);
  }

  editArgs(args: HTTPListenerArgs): void {
    this._args = args;
  }

  getStartTime(): null {
    return null;
  }

  setStartTime(): void {}
}
