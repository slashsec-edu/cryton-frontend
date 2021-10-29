import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DeltaForm } from '../../classes/stage-creation/forms/delta-form';
import { TriggerParameters } from '../../classes/stage-creation/trigger-parameters';
import { ERROR_MESSAGES } from './delta-trigger.errors';

@Component({
  selector: 'app-delta-trigger-parameters',
  templateUrl: './delta-trigger-parameters.component.html',
  styleUrls: ['./delta-trigger-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeltaTriggerParametersComponent extends TriggerParameters implements OnInit {
  @Input() triggerForm: DeltaForm;

  formGroup: FormGroup;

  constructor() {
    super(ERROR_MESSAGES);
  }

  ngOnInit(): void {
    this.formGroup = this.triggerForm.getArgsForm();
  }
}
