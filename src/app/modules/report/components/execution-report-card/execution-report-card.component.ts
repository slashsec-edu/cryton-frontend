import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { PlanExecutionReport } from 'src/app/models/api-responses/report/plan-execution-report.interface';

@Component({
  selector: 'app-execution-report-card',
  templateUrl: './execution-report-card.component.html',
  styleUrls: ['../report/report-shared.style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutionReportCardComponent implements OnInit {
  @Input() execution: PlanExecutionReport;

  constructor() {}

  ngOnInit(): void {}
}
