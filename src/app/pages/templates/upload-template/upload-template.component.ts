import { Component, Type } from '@angular/core';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { StepOverviewItem } from 'src/app/models/cryton-editor/interfaces/step-overview-item.interface';
import { TemplateUploadStepsComponent } from 'src/app/models/cryton-editor/steps/template-upload-steps/template-upload-steps.component';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';

@Component({
  selector: 'app-upload-template',
  templateUrl: './upload-template.component.html',
  styleUrls: ['./upload-template.component.scss'],
  animations: [renderComponentTrigger]
})
export class UploadTemplateComponent {
  uploadTemplateSteps: Type<TemplateUploadStepsComponent> = TemplateUploadStepsComponent;
  stepOverviewItems: StepOverviewItem[] = [{ name: 'Template Upload', type: StepType.SELECTABLE, required: true }];

  constructor() {}
}
