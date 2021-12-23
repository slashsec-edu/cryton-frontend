import { Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { StageNode } from '../../dependency-graph/node/stage-node';
import { TriggerParameters } from '../trigger-parameters';
import { HttpTriggerForm } from './http-form';

export interface TriggerForm {
  formComponent: Type<TriggerParameters>;

  /**
   * Returns trigger arguments form group.
   */
  getArgsForm(): FormGroup | HttpTriggerForm;

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
  fill(stage: StageNode): void;

  /**
   * Creates a copy of itself.
   */
  copy(): TriggerForm;

  /**
   * Decides if form is not empty.
   */
  isNotEmpty(): boolean;

  /**
   * Marks the form as untouched.
   */
  markAsUntouched(): void;
}
