import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { StageExecutionReport } from 'src/app/models/api-responses/report/stage-execution-report.interface';

@Component({
  selector: 'app-stage-report-card',
  templateUrl: './stage-report-card.component.html',
  styleUrls: ['./stage-report-card.component.scss', '../report/report-shared.style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageReportCardComponent implements OnInit {
  @Input() stage: StageExecutionReport;
  showSteps = false;

  constructor() {}

  ngOnInit(): void {}

  toggleSteps(): void {
    this.showSteps = !this.showSteps;
  }
}
