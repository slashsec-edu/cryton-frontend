import { Component, OnInit } from '@angular/core';
import { StepOverviewItem } from 'src/app/models/cryton-editor/interfaces/step-overview-item.interface';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { PlansCreationStepsComponent } from 'src/app/models/cryton-editor/steps/plans-creation-steps/plans-creation-steps.component';

@Component({
  selector: 'app-create-plan',
  templateUrl: './create-plan.component.html',
  styleUrls: ['./create-plan.component.scss']
})
export class CreatePlanComponent implements OnInit {
  editorSteps = PlansCreationStepsComponent;
  stepOverviewItems: StepOverviewItem[] = [
    { name: 'Select Template', type: StepType.SELECTABLE, required: true },
    { name: 'Upload Inventories', type: StepType.SELECTABLE, required: false }
  ];

  constructor() {}

  ngOnInit(): void {}
}
