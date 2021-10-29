import { Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CrytonStage } from '../../cryton-node/cryton-stage';
import { TriggerParameters } from '../trigger-parameters';

export interface TriggerForm {
  formComponent: Type<TriggerParameters>;

  /**
   * Returns trigger arguments form group.
   */
  getArgsForm(): FormGroup | Record<string, any>;

  /**
   * Returns arguments from form in a shape which
   * can be directly used as trigger args.
   */
  getArgs(): Record<string, any>;

  /**
   * Decides if form is filled out correcly.
   */
  isValid(): boolean;

  /**
   * Erases form contents.
   */
  erase(): void;

  /**
   * Fills trigger form with stage parameters.
   */
  fill(stage: CrytonStage): void;

  /**
   * Creates a copy of itself.
   */
  copy(): TriggerForm;

  /**
   * Decides if form is not empty.
   */
  isNotEmpty(): boolean;
}
