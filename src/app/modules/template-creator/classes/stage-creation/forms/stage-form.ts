import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { TriggerType } from '../../../models/enums/trigger-type';
import { NodeManager } from '../../dependency-tree/node-manager';
import { CrytonStage } from '../../cryton-node/cryton-stage';
import { DeltaForm } from './delta-form';
import { FormUtils } from './form-utils';
import { HttpForm } from './http-form';
import { TriggerForm } from './trigger-form.interface';
import { TriggerParameters } from '../trigger-parameters';
import { Type } from '@angular/core';
import { Observable } from 'rxjs';

const INITIAL_TRIGGER = TriggerType.DELTA;

export interface StageArgs {
  name: string;
  triggerType: TriggerType;
}

export class StageForm {
  ignoredName = null;
  triggerTypeChange$: Observable<TriggerType>;

  private _stageArgsForm: FormGroup;
  private _triggerForm: TriggerForm;
  private _nodeManager: NodeManager;

  private _triggerBackup: Record<string, TriggerForm> = {};

  constructor(nodeManager: NodeManager) {
    this._nodeManager = nodeManager;

    this._stageArgsForm = new FormGroup({
      name: new FormControl(null, [Validators.required, this._uniqueNameValidator]),
      triggerType: new FormControl(INITIAL_TRIGGER, Validators.required)
    });
    this._triggerForm = this._createTriggerForm(INITIAL_TRIGGER);

    this.triggerTypeChange$ = this._stageArgsForm.get('triggerType').valueChanges as Observable<TriggerType>;
    this.triggerTypeChange$.subscribe(value => this._changeTriggerForm(value));
  }

  getStageArgsForm(): FormGroup {
    return this._stageArgsForm;
  }

  getStageArgs(): StageArgs {
    return this._stageArgsForm.value as StageArgs;
  }

  getTriggerForm(): TriggerForm {
    return this._triggerForm;
  }

  getTriggerArgsForm(): FormGroup | Record<string, any> {
    return this._triggerForm.getArgsForm();
  }

  getTriggerArgs(): Record<string, any> {
    return this._triggerForm.getArgs();
  }

  getTriggerFormComponent(): Type<TriggerParameters> {
    return this._triggerForm.formComponent;
  }

  fill(stage: CrytonStage): void {
    this._stageArgsForm.setValue({
      name: stage.name,
      triggerType: stage.trigger.getType()
    });

    this._triggerForm.fill(stage);
  }

  erase(): void {
    this._stageArgsForm.get('name').reset();
    this._stageArgsForm.get('triggerType').setValue(INITIAL_TRIGGER);
    this._triggerForm.erase();
  }

  isValid(): boolean {
    return this._stageArgsForm.valid && this._triggerForm.isValid();
  }

  copy(): StageForm {
    const copyForm = new StageForm(this._nodeManager);

    copyForm._stageArgsForm.setValue(this._stageArgsForm.value);

    return copyForm;
  }

  isNotEmpty(): boolean {
    return FormUtils.someValueDefined(this._stageArgsForm.value) || this._triggerForm.isNotEmpty();
  }

  private _changeTriggerForm(type: TriggerType): void {
    const backupForm = this._triggerBackup[type];

    if (backupForm) {
      this._triggerForm = backupForm;
    } else {
      this._triggerForm = this._createTriggerForm(type);
    }
  }

  private _createTriggerForm(type: TriggerType): TriggerForm {
    let triggerForm: TriggerForm;

    switch (type) {
      case TriggerType.DELTA:
        triggerForm = new DeltaForm();
        break;
      case TriggerType.HTTP_LISTENER:
        triggerForm = new HttpForm();
        break;
      default:
        throw new Error('Unknown trigger type');
    }

    this._triggerBackup[type] = triggerForm;
    return triggerForm;
  }

  /**
   * Validator function for stage name form control.
   * Checks if stage name is unique inside the parent dependency tree.
   *
   * @param control Name form control.
   * @returns Validation errors.
   */
  private _uniqueNameValidator = (control: AbstractControl): ValidationErrors | null =>
    this._nodeManager.isNodeNameUnique(control.value, this.ignoredName) ? null : { notUnique: true };
}
