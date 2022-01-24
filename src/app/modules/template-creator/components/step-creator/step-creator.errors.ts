import { FormGroup } from '@angular/forms';

const ERROR_MESSAGES: Record<string, Record<string, string>> = {
  name: {
    required: 'Name is required.',
    notUnique: 'Name must be unique.'
  },
  attackModule: {
    required: 'Attack module is required.'
  },
  attackModuleArgs: {
    required: 'Attack module arguments are required.',
    invalidYaml: 'Invalid YAML format.'
  }
};

export const getControlError = (formGroup: FormGroup, controlName: string): string => {
  const errors = formGroup.get(controlName).errors;

  return errors ? ERROR_MESSAGES[controlName][Object.keys(errors)[0]] : null;
};
