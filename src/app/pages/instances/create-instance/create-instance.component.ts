import { Component, OnInit } from '@angular/core';
import { StepOverviewItem } from 'src/app/models/cryton-editor/interfaces/step-overview-item.interface';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { InstancesCreationStepsComponent } from 'src/app/models/cryton-editor/steps/instances-creation-steps/instances-creation-steps.component';

@Component({
  selector: 'app-create-instance',
  templateUrl: './create-instance.component.html',
  styleUrls: ['./create-instance.component.scss']
})
export class CreateInstanceComponent implements OnInit {
  editorSteps = InstancesCreationStepsComponent;
  stepOverviewItems: StepOverviewItem[] = [
    { name: 'Select Template', type: StepType.SELECTABLE, required: true },
    { name: 'Upload Inventories', type: StepType.SELECTABLE, required: false }
  ];

  constructor() {}

  ngOnInit(): void {}
}
