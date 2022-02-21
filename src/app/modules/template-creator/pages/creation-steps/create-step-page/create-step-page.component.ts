import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-create-step-page',
  templateUrl: './create-step-page.component.html',
  styleUrls: ['./create-step-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateStepPageComponent {
  constructor() {}
}
