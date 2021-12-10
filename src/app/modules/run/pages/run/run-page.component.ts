import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, delay, first, switchMapTo } from 'rxjs/operators';
import { Report } from 'src/app/models/api-responses/report/report.interface';
import { AlertService } from 'src/app/services/alert.service';
import { RunService } from 'src/app/services/run.service';

@Component({
  selector: 'app-run-page',
  templateUrl: './run-page.component.html',
  styleUrls: ['./run-page.component.scss', '../../styles/report.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunPageComponent implements OnInit {
  report$ = new BehaviorSubject<Report>(null);
  loading$ = new BehaviorSubject<boolean>(false);
  runID: number;

  constructor(private _route: ActivatedRoute, private _runService: RunService, private _alert: AlertService) {}

  ngOnInit(): void {
    this.runID = parseInt(this._route.snapshot.paramMap.get('id'), 10);
    this.loadReport();
  }

  downloadReport(): void {
    this._runService.downloadReport(this.runID);
  }

  loadReport(): void {
    this.loading$.next(true);
    of({})
      .pipe(
        first(),
        delay(200),
        switchMapTo(this._runService.fetchReport(this.runID).pipe(first())),
        catchError(() => throwError('Fetching report failed.'))
      )
      .subscribe({
        next: report => {
          this.loading$.next(false);
          this.report$.next(report);
        },
        error: err => {
          this.loading$.next(false);
          this._alert.showError(err);
        }
      });
  }
}
