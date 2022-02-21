import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-introduction-page',
  templateUrl: './introduction-page.component.html',
  styleUrls: ['./introduction-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateCreatorIntroductionComponent {
  constructor() {}
}
