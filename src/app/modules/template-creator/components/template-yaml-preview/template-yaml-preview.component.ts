import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { parse } from 'yaml';
import { TemplateDescription } from '../../models/interfaces/template-description';
import { InvalidTemplateFormatError } from './errors/invalid-template-format.error';
import { NotASequenceError } from './errors/not-a-sequence.error';
import { NotUniqueNameError } from './errors/not-unique-name.error';
import { UndefinedTemplatePropertyError } from './errors/undefined-template-property.error';

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
    const templateControlVal = this.templateControl.value as string;

    try {
      if (!templateControlVal) {
        throw new InvalidTemplateFormatError();
      }
      const template = this._tryParsingTemplate(this.templateControl.value as string);
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
      throw new InvalidTemplateFormatError();
    }
  }

  private _checkTemplateValues(template: TemplateDescription): void {
    if (!template || !template.plan) {
      throw new InvalidTemplateFormatError();
    } else if (!template.plan.name || template.plan.name === '') {
      throw new UndefinedTemplatePropertyError('name');
    } else if (!template.plan.owner || template.plan.owner === '') {
      throw new UndefinedTemplatePropertyError('owner');
    }
  }

  private _checkNameUniqueness(template: TemplateDescription): void {
    if (!template.plan.stages) {
      throw new UndefinedTemplatePropertyError('stages');
    } else if (!Array.isArray(template.plan.stages)) {
      throw new NotASequenceError('stages');
    } else if (template.plan.stages.length === 0) {
      throw new UndefinedTemplatePropertyError('stages');
    }
    template.plan.stages.forEach((currentStage, i) => {
      const stageNameCount = template.plan.stages.filter(stage => stage.name === currentStage.name).length;

      if (!currentStage.name || currentStage.name === '') {
        throw new UndefinedTemplatePropertyError(`name of stage at index: ${i}`);
      }
      if (stageNameCount > 1) {
        throw new NotUniqueNameError(currentStage.name);
      }

      if (!currentStage.steps) {
        throw new UndefinedTemplatePropertyError(`steps in stage: ${currentStage.name}`);
      } else if (!Array.isArray(currentStage.steps)) {
        throw new NotASequenceError(`steps of stage: ${currentStage.name}`);
      } else if (currentStage.steps.length === 0) {
        throw new UndefinedTemplatePropertyError(`steps in stage: ${currentStage.name}`);
      }
      currentStage.steps.forEach((currentStep, j) => {
        if (!currentStep.name || currentStep.name === '') {
          throw new UndefinedTemplatePropertyError(`name of step at index: ${j} inside stage: ${currentStage.name}`);
        }

        const stepNameCount = currentStage.steps.filter(step => step.name === currentStep.name).length;

        if (stepNameCount > 1) {
          throw new NotUniqueNameError(currentStep.name);
        }
      });
    });
  }
}
