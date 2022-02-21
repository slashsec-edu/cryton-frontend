import { Component, Type } from '@angular/core';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { StepOverviewItem } from 'src/app/models/cryton-editor/interfaces/step-overview-item.interface';
import { WorkerCreationStepsComponent } from 'src/app/models/cryton-editor/steps/worker-creation-steps/worker-creation-steps.component';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';

@Component({
  selector: 'app-create-worker',
  templateUrl: './create-worker.component.html',
  styleUrls: ['./create-worker.component.scss'],
  animations: [renderComponentTrigger]
})
export class CreateWorkerComponent {
  editorSteps: Type<WorkerCreationStepsComponent> = WorkerCreationStepsComponent;
  stepOverviewItems: StepOverviewItem[] = [{ name: 'Creation Progress', type: StepType.COMPLETION, required: true }];

  constructor() {}
}
