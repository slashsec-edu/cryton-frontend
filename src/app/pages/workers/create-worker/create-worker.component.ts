import { Component, OnInit, Type } from '@angular/core';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { StepOverviewItem } from 'src/app/models/cryton-editor/interfaces/step-overview-item.interface';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { WorkerCreationStepsComponent } from 'src/app/models/cryton-editor/steps/worker-creation-steps/worker-creation-steps.component';

@Component({
  selector: 'app-create-worker',
  templateUrl: './create-worker.component.html',
  styleUrls: ['./create-worker.component.scss'],
  animations: [renderComponentTrigger]
})
export class CreateWorkerComponent implements OnInit {
  editorSteps: Type<any> = WorkerCreationStepsComponent;
  stepOverviewItems: StepOverviewItem[] = [{ name: 'Creation Progress', type: StepType.COMPLETION, required: true }];

  constructor() {}

  ngOnInit(): void {}
}
