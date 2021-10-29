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
  stageFormBackup: StageForm;

  // BUILD TEMPLATE TAB
  buildTemplateDisplayedComponent: BuildTemplateDisplay;
  templateParametersFormGroup: FormGroup;

  // CREATE STEP TAB
  stepParametersFormGroup: FormGroup;
  editedStep: CrytonStep;

  // Timeline
  timeline: TemplateTimeline;

  constructor() {
    this._initState();
  }

  /**
   * Clears saved state.
   */
  clear(): void {
    this.editedStage = null;
    this.stageForm = null;
    this.stageFormBackup = null;

    this._initState();
  }

  /**
   * Initializes default state values.
   */
  private _initState(): void {
    this.isDependencyTreeDisplayed = false;
    this.buildTemplateDisplayedComponent = BuildTemplateDisplay.BUILD_TEMPLATE;
    this.templateParametersFormGroup = new FormGroup({
      name: new FormControl(null, Validators.required),
      owner: new FormControl(null, Validators.required)
    });
    this.stepParametersFormGroup = new FormGroup({
      name: new FormControl(null, [Validators.required]),
      attackModule: new FormControl(null, [Validators.required]),
      attackModuleArgs: new FormControl(null, [Validators.required])
    });
    this.timeline = new TemplateTimeline();
  }
}
