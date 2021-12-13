import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { parse } from 'yaml';
import { TemplateDescription } from '../../models/interfaces/template-description';

@Component({
  selector: 'app-template-yaml-preview',
  templateUrl: './template-yaml-preview.component.html',
  styleUrls: ['./template-yaml-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateYamlPreviewComponent implements OnInit {
  templateYAML: string;
  templateControl = new FormControl('', [Validators.required]);

  constructor(
    private _dialogRef: MatDialogRef<TemplateYamlPreviewComponent>,
    private _alert: AlertService,
    @Inject(MAT_DIALOG_DATA) private _data: { template: string }
  ) {}

  ngOnInit(): void {
    this.templateYAML = this._data.template;
    this.templateControl.setValue(this.templateYAML);
  }

  handleCreate(): void {
    try {
      const template = this._tryParsingTemplate(this.templateControl.value);
      this._checkTemplateValues(template);
      this._checkNameUniqueness(template);
      this._dialogRef.close(this.templateControl.value);
    } catch (e) {
      if (e instanceof Error) {
        this._alert.showError(e.message);
      }
    }
  }

  private _tryParsingTemplate(templateYaml: string): TemplateDescription {
    try {
      return parse(templateYaml) as TemplateDescription;
    } catch (e) {
      console.error(e);
      throw new Error('Invalid template format.');
    }
  }

  private _checkTemplateValues(template: TemplateDescription): void {
    if (!template || !template.plan) {
      throw new Error('Template cannot be empty.');
    } else if (!template.plan.name || template.plan.name === '') {
      throw new Error('Empty template name.');
    } else if (!template.plan.owner || template.plan.owner === '') {
      throw new Error('Empty template owner.');
    }
  }

  private _checkNameUniqueness(template: TemplateDescription): void {
    if (!template.plan.stages) {
      throw new Error('No stages defined in template.');
    } else if (!Array.isArray(template.plan.stages)) {
      throw new Error('Stages are not defined as a sequence.');
    } else if (template.plan.stages.length === 0) {
      throw new Error('No stages defined in template.');
    }
    template.plan.stages.forEach((currentStage, i) => {
      const stageNameCount = template.plan.stages.filter(stage => stage.name === currentStage.name).length;

      if (!currentStage.name || currentStage.name === '') {
        throw new Error(`Stage with index: ${i} doesn't have a name.`);
      }
      if (stageNameCount > 1) {
        throw new Error(`Multiple stages with name: ${currentStage.name}`);
      }

      if (!currentStage.steps) {
        throw new Error(`No steps defined in stage: ${currentStage.name}`);
      } else if (!Array.isArray(currentStage.steps)) {
        throw new Error(`Steps of stage: ${currentStage.name} are not defined as a sequence.`);
      } else if (currentStage.steps.length === 0) {
        throw new Error(`No steps defined in stage: ${currentStage.name}`);
      }
      currentStage.steps.forEach((currentStep, j) => {
        if (!currentStep.name || currentStep.name === '') {
          throw new Error(`Step with index: ${j} inside stage: ${currentStage.name} doesnt have a name.`);
        }

        const stepNameCount = currentStage.steps.filter(step => step.name === currentStep.name).length;

        if (stepNameCount > 1) {
          throw new Error(`Multiple steps with name: ${currentStep.name}`);
        }
      });
    });
  }
}
