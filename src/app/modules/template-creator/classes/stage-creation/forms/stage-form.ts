import { Type } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { TriggerType } from '../../../models/enums/trigger-type';
import { NodeManager } from '../../dependency-graph/node-manager';
import { StageNode } from '../../dependency-graph/node/stage-node';
import { TriggerArgs } from '../../triggers/trigger';
import { TriggerParameters } from '../trigger-parameters';
import { DateTimeForm } from './date-time-form';
import { DeltaForm } from './delta-form';
import { HttpForm, HttpTriggerForm } from './http-form';
import { TriggerForm } from './trigger-form.interface';

const INITIAL_TRIGGER = TriggerType.DELTA;

export interface StageArgs {
  name: string;
  triggerType: TriggerType;
}

export class StageForm {
  editedNodeName = null;
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

  getTriggerArgsForm(): FormGroup | HttpTriggerForm {
    return this._triggerForm.getArgsForm();
  }

  getTriggerArgs(): TriggerArgs {
    return this._triggerForm.getArgs();
  }

  getTriggerFormComponent(): Type<TriggerParameters> {
    return this._triggerForm.formComponent;
  }

  fill(stage: StageNode): void {
    this._stageArgsForm.setValue({
      name: stage.name,
      triggerType: stage.trigger.getType()
    });

    this._triggerForm.fill(stage);
  }

  fillWithEditedStage(stage: StageNode): void {
    this.editedNodeName = stage.name;
    this.fill(stage);
  }

  erase(): void {
    this._triggerForm.erase();
    this._stageArgsForm.get('name').reset();
    this._stageArgsForm.get('triggerType').setValue(INITIAL_TRIGGER);
  }

  cancelEditing(): void {
    this.editedNodeName = null;
    this.erase();
  }

  isValid(): boolean {
    return this._stageArgsForm.valid && this._triggerForm.isValid();
  }

  markAsUntouched(): void {
    this._stageArgsForm.markAsUntouched();
    this._triggerForm.markAsUntouched();
  }

  copy(): StageForm {
    const copyForm = new StageForm(this._nodeManager);

    copyForm._stageArgsForm.setValue(this._stageArgsForm.value);
    copyForm._triggerForm = this._triggerForm.copy();

    return copyForm;
  }

  isNotEmpty(): boolean {
    return Boolean(this._stageArgsForm.get('name').value) || this._triggerForm.isNotEmpty();
  }

  changeNodeManager(nodeManager: NodeManager): void {
    this._nodeManager = nodeManager;
    const nameControl = this._stageArgsForm.get('name');

    nameControl.clearValidators();
    nameControl.setValidators([Validators.required, this._uniqueNameValidator]);
    nameControl.updateValueAndValidity();
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
      case TriggerType.DATE_TIME:
        triggerForm = new DateTimeForm();
        break;
      default:
        throw new Error('Unknown trigger type');
    }

    this._triggerBackup[type] = triggerForm;
    return triggerForm;
  }

  /**
   * Validator function for stage name form control.
   * Checks if stage name is unique inside the parent dependency graph.
   *
   * @param control Name form control.
   * @returns Validation errors.
   */
  private _uniqueNameValidator = (control: AbstractControl): ValidationErrors | null =>
    this._nodeManager.isNodeNameUnique(control.value, this.editedNodeName) ? null : { notUnique: true };
}
