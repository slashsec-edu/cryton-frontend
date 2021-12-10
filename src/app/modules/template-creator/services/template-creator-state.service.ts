import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TemplateTimeline } from '../classes/timeline/template-timeline';
import { BuildTemplateDisplay } from '../models/enums/build-template-display.enum';
import { StageForm } from '../classes/stage-creation/forms/stage-form';
import { StageNode } from '../classes/dependency-tree/node/stage-node';

@Injectable({
  providedIn: 'root'
})
export class TemplateCreatorStateService {
  // CREATE STAGE TAB
  isDependencyTreeDisplayed: boolean;
  editedStage: StageNode;
  stageForm: StageForm;

  // BUILD TEMPLATE TAB
  buildTemplateDisplayedComponent: BuildTemplateDisplay;
  templateForm: FormGroup;

  // Timeline
  timeline: TemplateTimeline;

  private _stageFormBackup: StageForm;

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
   * Backs up stage form.
   */
  backupStageForm(): void {
    this._stageFormBackup = this.stageForm;
  }

  /**
   * Initializes default state values.
   */
  private _initState(): void {
    this.isDependencyTreeDisplayed = false;
    this.buildTemplateDisplayedComponent = BuildTemplateDisplay.BUILD_TEMPLATE;
    this.templateForm = this._createTemplateForm();
    this.timeline = new TemplateTimeline();
  }

  private _createTemplateForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      owner: new FormControl('', Validators.required)
    });
  }
}
