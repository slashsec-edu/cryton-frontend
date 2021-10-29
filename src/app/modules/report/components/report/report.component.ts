import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Report } from 'src/app/models/api-responses/report/report.interface';
import { RunService } from 'src/app/services/run.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss', './report-shared.style.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportComponent implements OnInit {
  report$: Observable<Report>;
  runID: number;

  constructor(private _route: ActivatedRoute, private _runService: RunService, private _router: Router) {}

  ngOnInit(): void {
    this.runID = parseInt(this._route.snapshot.paramMap.get('id'), 10);
    this.report$ = this._runService.fetchReport(this.runID);
  }

  downloadReport(): void {
    this._runService.downloadReport(this.runID);
  }

  showTimeline(): void {
    this._router.navigate(['app', 'reports', this.runID, 'timeline']);
  }
}
