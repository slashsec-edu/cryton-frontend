import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Worker } from '../../../../models/api-responses/worker.interface';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { WorkersService } from 'src/app/services/workers.service';
import { catchError, first } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-worker-table',
  templateUrl: './worker-table.component.html',
  styleUrls: ['./worker-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WorkerTableComponent implements OnInit, OnDestroy {
  @Input() data: Worker;
  @Input() clickable = false;

  loading$ = new BehaviorSubject<boolean>(false);
  maxStringLength = 15;

  private _destroySubject$ = new Subject<void>();
  private _currentTimeout: any;

  constructor(private _workerSevice: WorkersService, private _cd: ChangeDetectorRef, private _alert: AlertService) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._destroySubject$.next();
    this._destroySubject$.complete();
  }

  // Returns class corresponding to worker state
  getStateColor(state: string): string {
    const lowerState: string = state.toLowerCase();
    const nameBase = 'state-';

    return nameBase + lowerState;
  }

  getTooltip(text: string): string {
    return text.length > this.maxStringLength ? text : null;
  }

  healthCheck(): void {
    clearTimeout(this._currentTimeout);
    this.loading$.next(true);

    this._currentTimeout = setTimeout(() => {
      this._healthCheck();
    }, environment.refreshDelay);
  }

  private _healthCheck(): void {
    this._workerSevice
      .healthCheck(this.data.id)
      .pipe(
        first(),
        catchError(() => throwError('Healthcheck failed.'))
      )
      .subscribe({
        next: result => {
          const newData = JSON.parse(JSON.stringify(this.data)) as Worker;
          newData.state = result.detail.worker_state;
          this.data = newData;
          this.loading$.next(false);
          this._alert.showSuccess(`Worker ${this.data.id} is ${result.detail.worker_state}.`);
          this._cd.detectChanges();
        },
        error: err => {
          this.loading$.next(false);
          this._alert.showError(err);
        }
      });
  }
}
