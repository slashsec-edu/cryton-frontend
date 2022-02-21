import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DeltaTriggerParametersComponent } from '../../../components/delta-trigger-parameters/delta-trigger-parameters.component';
import { DeltaArgs } from '../../../models/interfaces/delta-args';
import { StageNode } from '../../dependency-graph/node/stage-node';
import { FormUtils } from './form-utils';
import { TriggerForm } from './trigger-form.interface';

export class DeltaForm implements TriggerForm {
  formComponent = DeltaTriggerParametersComponent;

  private _triggerArgsForm = new FormGroup({
    hours: new FormControl(0, [Validators.required, Validators.min(0)]),
    minutes: new FormControl(0, [Validators.required, Validators.min(0)]),
    seconds: new FormControl(0, [Validators.required, Validators.min(0)])
  });

  constructor() {}

  getArgsForm(): FormGroup {
    return this._triggerArgsForm;
  }

  getArgs(): DeltaArgs {
    const { hours, minutes, seconds } = this._triggerArgsForm.value as Record<string, string>;

    return {
      hours: parseInt(hours, 10) ?? 0,
      minutes: parseInt(minutes, 10) ?? 0,
      seconds: parseInt(seconds, 10) ?? 0
    };
  }

  isValid(): boolean {
    return this._triggerArgsForm.valid;
  }

  erase(): void {
    this._triggerArgsForm.reset();
    this._triggerArgsForm.setValue({ hours: 0, minutes: 0, seconds: 0 });
  }

  fill(stage: StageNode): void {
    this._triggerArgsForm.setValue(stage.trigger.getArgs());
  }

  copy(): DeltaForm {
    const copyForm = new DeltaForm();
    copyForm._triggerArgsForm.setValue(this._triggerArgsForm.value as DeltaArgs);
    return copyForm;
  }

  markAsUntouched(): void {
    this._triggerArgsForm.markAsUntouched();
  }

  isNotEmpty(): boolean {
    return FormUtils.someValueOtherThan(this._triggerArgsForm.value as Record<string, string>, 0);
  }
}
