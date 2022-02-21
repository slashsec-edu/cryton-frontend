import { Component } from '@angular/core';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { StepOverviewItem } from 'src/app/models/cryton-editor/interfaces/step-overview-item.interface';
import { RunCreationStepsComponent } from 'src/app/models/cryton-editor/steps/run-creation-steps/run-creation-steps.component';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';

@Component({
  selector: 'app-create-run',
  templateUrl: './create-run.component.html',
  styleUrls: ['./create-run.component.scss'],
  animations: [renderComponentTrigger]
})
export class CreateRunComponent {
  editorSteps = RunCreationStepsComponent;
  stepOverviewItems: StepOverviewItem[] = [
    { name: 'Plan', type: StepType.SELECTABLE, required: true },
    { name: 'Workers', type: StepType.SELECTABLE, required: true },
    { name: 'Execution variables', type: StepType.SELECTABLE, required: false }
  ];

  constructor() {}
}
