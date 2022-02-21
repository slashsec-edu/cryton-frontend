import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { HttpForm } from '../../classes/stage-creation/forms/http-form';
import { TriggerParameters } from '../../classes/stage-creation/trigger-parameters';
import { ERROR_MESSAGES } from './http-trigger.errors';

@Component({
  selector: 'app-http-trigger-parameters',
  templateUrl: './http-trigger-parameters.component.html',
  styleUrls: ['./http-trigger-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HttpTriggerParametersComponent extends TriggerParameters {
  @Input() triggerForm: HttpForm;

  constructor() {
    super(ERROR_MESSAGES);
  }
}
