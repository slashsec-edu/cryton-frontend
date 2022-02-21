import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-template-timeline-help',
  templateUrl: './template-timeline-help.component.html',
  styleUrls: ['./template-timeline-help.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateTimelineHelpComponent {
  constructor() {}
}
