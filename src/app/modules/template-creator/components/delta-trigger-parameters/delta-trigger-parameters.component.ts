import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DeltaForm } from '../../classes/stage-creation/forms/delta-form';
import { TriggerParameters } from '../../classes/stage-creation/trigger-parameters';
import { ERROR_MESSAGES } from './delta-trigger.errors';

@Component({
  selector: 'app-delta-trigger-parameters',
  templateUrl: './delta-trigger-parameters.component.html',
  styleUrls: ['./delta-trigger-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeltaTriggerParametersComponent extends TriggerParameters {
  @Input() triggerForm: DeltaForm;

  constructor() {
    super(ERROR_MESSAGES);
  }
}
