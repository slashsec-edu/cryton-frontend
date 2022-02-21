import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { StageNode } from '../classes/dependency-graph/node/stage-node';
import { StageForm } from '../classes/stage-creation/forms/stage-form';
import { TemplateTimeline } from '../classes/timeline/template-timeline';
import { BuildTemplateDisplay } from '../models/enums/build-template-display.enum';
import { DependencyGraphManagerService, DepGraphRef } from './dependency-graph-manager.service';

@Injectable({
  providedIn: 'root'
})
export class TemplateCreatorStateService {
  // CREATE STAGE TAB
  isDependencyGraphDisplayed: boolean;
  editedStage: StageNode;
  stageForm: StageForm;

  // BUILD TEMPLATE TAB
  buildTemplateDisplayedComponent: BuildTemplateDisplay;
  templateForm: FormGroup;

  // Timeline
  timeline: TemplateTimeline;

  private _stageFormBackup: StageForm;

  constructor(private _graphManager: DependencyGraphManagerService) {
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
    this._stageFormBackup = this.stageForm.copy();
  }

  resetStageForm(backup = true): void {
    if (backup) {
      this.backupStageForm();
    }
    this.stageForm = this._createStageForm();
  }

  /**
   * Initializes default state values.
   */
  private _initState(): void {
    this.isDependencyGraphDisplayed = false;
    this.buildTemplateDisplayedComponent = BuildTemplateDisplay.BUILD_TEMPLATE;
    this.timeline = new TemplateTimeline();
    this.templateForm = this._createTemplateForm();
    this.stageForm = this._createStageForm();
  }

  private _createTemplateForm(): FormGroup {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      owner: new FormControl('', Validators.required)
    });
  }

  /**
   * Creates new stage form with current node manager.
   *
   * @returns Stage form.
   */
  private _createStageForm(): StageForm {
    const nodeManager = this._graphManager.getCurrentGraph(DepGraphRef.TEMPLATE_CREATION).value.graphNodeManager;
    return new StageForm(nodeManager);
  }
}
