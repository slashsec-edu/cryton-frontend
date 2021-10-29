import { FormGroup } from '@angular/forms';
import { ErrorMessages } from '../../models/types/errorsMessages.type';
import { TriggerForm } from './forms/trigger-form.interface';

export abstract class TriggerParameters {
  triggerForm: TriggerForm;

  private _errorMessages: ErrorMessages;

  constructor(errorMessages: ErrorMessages) {
    this._errorMessages = errorMessages;
  }

  getControlError = (controlName: string, formGroup: FormGroup): string => {
    const errors = formGroup.get(controlName).errors;

    if (!errors) {
      return null;
    }

    const firstError = Object.keys(errors)[0];

    if (firstError === 'required') {
      return 'Field is required.';
    }

    return errors ? this._errorMessages[controlName][Object.keys(errors)[0]] : null;
  };
}
