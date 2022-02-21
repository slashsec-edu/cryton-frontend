import { FormControl, FormGroup } from '@angular/forms';
import { DateTimeTriggerParametersComponent } from '../../../components/date-time-trigger-parameters/date-time-trigger-parameters.component';
import { DateTimeArgs } from '../../../models/interfaces/date-time-args';
import { StageNode } from '../../dependency-graph/node/stage-node';
import { DateTimeUtils } from '../utils/date-time.utils';
import { FormUtils } from './form-utils';
import { TriggerForm } from './trigger-form.interface';

type TriggerArgsFormValue = DateTimeArgs & {
  displayDateTime: string;
};

export class DateTimeForm implements TriggerForm {
  formComponent = DateTimeTriggerParametersComponent;

  private _triggerArgsForm = new FormGroup({
    timezone: new FormControl(null),
    year: new FormControl(null),
    month: new FormControl(null),
    day: new FormControl(null),
    hour: new FormControl(null),
    minute: new FormControl(null),
    second: new FormControl(null),
    displayDateTime: new FormControl({ value: null, disabled: true })
  });

  constructor() {}

  getArgsForm(): FormGroup {
    return this._triggerArgsForm;
  }

  getArgs(): DateTimeArgs {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { displayDateTime, ...dateTimeArgs } = this._triggerArgsForm.value as TriggerArgsFormValue;

    return dateTimeArgs;
  }

  isValid(): boolean {
    return this._triggerArgsForm.valid;
  }

  erase(): void {
    this._triggerArgsForm.reset();
  }

  fill(stage: StageNode): void {
    const stageTriggerArgs = stage.trigger.getArgs() as DateTimeArgs;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { timezone, ...dateArgs } = stageTriggerArgs;
    this._triggerArgsForm.patchValue(stageTriggerArgs);

    const selecteDate = DateTimeUtils.dateFromDateTimeArgs(dateArgs as DateTimeArgs);

    if (selecteDate) {
      this._triggerArgsForm.get('displayDateTime').setValue(selecteDate.toLocaleString());
    }
  }

  copy(): DateTimeForm {
    const copyForm = new DateTimeForm();
    copyForm._triggerArgsForm.patchValue(this._triggerArgsForm.value as DateTimeArgs);

    return copyForm;
  }

  markAsUntouched(): void {
    this._triggerArgsForm.markAsUntouched();
  }

  isNotEmpty(): boolean {
    return FormUtils.someValueOtherThan(this._triggerArgsForm.value as Record<string, string>, null);
  }
}
