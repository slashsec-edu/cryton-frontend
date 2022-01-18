import { Component, OnInit } from '@angular/core';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { StepOverviewItem } from 'src/app/models/cryton-editor/interfaces/step-overview-item.interface';
import { RunCreationStepsComponent } from 'src/app/models/cryton-editor/steps/run-creation-steps/run-creation-steps.component';

@Component({
  selector: 'app-create-run',
  templateUrl: './create-run.component.html',
  styleUrls: ['./create-run.component.scss'],
  animations: [renderComponentTrigger]
})
export class CreateRunComponent implements OnInit {
  editorSteps = RunCreationStepsComponent;
  stepOverviewItems: StepOverviewItem[] = [
    { name: 'Plan', type: StepType.SELECTABLE, required: true },
    { name: 'Workers', type: StepType.SELECTABLE, required: true },
    { name: 'Execution variables', type: StepType.SELECTABLE, required: false }
  ];

  constructor() {}

  ngOnInit(): void {}
}
