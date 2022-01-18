import { FormGroup } from '@angular/forms';

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  path: {
    required: 'Path is required',
    sectionToVariable: `Can't overwrite a section with the same path`,
    variableToSection: `Can't overwrite a variable with the same path`,
    endingDot: `Path can't end with a dot`,
    emptySection: `Section name can't be empty`
  },
  value: {
    required: 'Value is required'
  }
};

export const getControlError = (formGroup: FormGroup, controlName: string): string => {
  const errors = formGroup.get(controlName).errors;
  return errors ? ERROR_MESSAGES[controlName][Object.keys(errors)[0]] : null;
};
