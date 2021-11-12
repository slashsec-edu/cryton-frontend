import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CrytonStage } from '../classes/cryton-node/cryton-stage';
import { CrytonStep } from '../classes/cryton-node/cryton-step';
import { TemplateTimeline } from '../classes/timeline/template-timeline';
import { BuildTemplateDisplay } from '../models/enums/build-template-display.enum';
import { StageForm } from '../classes/stage-creation/forms/stage-form';

@Injectable({
  providedIn: 'root'
})
export class TemplateCreatorStateService {
  // CREATE STAGE TAB
  isDependencyTreeDisplayed: boolean;
  editedStage: CrytonStage;
  stageForm: StageForm;

  // BUILD TEMPLATE TAB
  buildTemplateDisplayedComponent: BuildTemplateDisplay;
  templateForm: FormGroup;

  // CREATE STEP TAB
  stepForm: FormGroup;
  editedStep: CrytonStep;

  // Timeline
  timeline: TemplateTimeline;

  private _stageFormBackup: StageForm;
  private _stepFormValueBackup: Record<string, string>;

  constructor() {
    this._initState();
  }

  /**
   * Clears saved state.
   */
  clear(): void {
    this.editedStage = null;
    this.stageForm = null;
    this._stageFormBackup = null;
    this._stepFormValueBackup = null;

    this._initState();
  }

  /**
   * Restores stage form from backup, returns true if there was a backed up form.
   */
  restoreStageForm(): boolean {
    if (this._stageFormBackup) {
      this.stageForm = this._stageFormBackup;
      this.stageForm.markAsUntouched();
      this._stageFormBackup = null;
      return true;
    }
    return false;
  }

  /**
   * Restores step form from backup, returns true if there was a backed up form value.
   */
  restoreStepForm(): boolean {
    if (this._stepFormValueBackup) {
      this.stepForm.setValue(this._stepFormValueBackup);
      this.stepForm.markAsUntouched();
      this._stepFormValueBackup = null;
      return true;
    }
    return false;
  }

  /**
   * Backs up stage form.
   */
  backupStageForm(): void {
    this._stageFormBackup = this.stageForm;
  }

  /**
   * Backs up step form.
   */
  backupStepForm(): void {
    this._stepFormValueBackup = JSON.parse(JSON.stringify(this.stepForm.value)) as Record<string, string>;
  }

  /**
   * Initializes default state values.
   */
  private _initState(): void {
    this.isDependencyTreeDisplayed = false;
    this.buildTemplateDisplayedComponent = BuildTemplateDisplay.BUILD_TEMPLATE;
    this.templateForm = this._createTemplateForm();
    this.stepForm = this._createStepForm();
    this.timeline = new TemplateTimeline();
  }

  private _createTemplateForm(): FormGroup {
    return new FormGroup({
      name: new FormControl(null, Validators.required),
      owner: new FormControl(null, Validators.required)
    });
  }

  private _createStepForm(): FormGroup {
    return new FormGroup({
      name: new FormControl(null, [Validators.required]),
      attackModule: new FormControl(null, [Validators.required]),
      attackModuleArgs: new FormControl(null, [Validators.required])
    });
  }
}
