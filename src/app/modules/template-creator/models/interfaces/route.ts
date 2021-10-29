import { FormGroup } from '@angular/forms';

/**
 * HTTP listener stage route form groups model.
 */
export interface Route {
  args: FormGroup;
  parameters: FormGroup[];
}
