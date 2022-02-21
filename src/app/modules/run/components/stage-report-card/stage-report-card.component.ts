import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { StageExecutionReport } from 'src/app/models/api-responses/report/stage-execution-report.interface';

@Component({
  selector: 'app-stage-report-card',
  templateUrl: './stage-report-card.component.html',
  styleUrls: ['./stage-report-card.component.scss', '../../styles/report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageReportCardComponent {
  @Input() stage: StageExecutionReport;
  showSteps = false;

  constructor() {}

  toggleSteps(): void {
    this.showSteps = !this.showSteps;
  }
}
