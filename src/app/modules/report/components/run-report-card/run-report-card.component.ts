import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Report } from 'src/app/models/api-responses/report/report.interface';

@Component({
  selector: 'app-run-report-card',
  templateUrl: './run-report-card.component.html',
  styleUrls: ['../report/report-shared.style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunReportCardComponent implements OnInit {
  @Input() report: Report;

  constructor() {}

  ngOnInit(): void {}
}
