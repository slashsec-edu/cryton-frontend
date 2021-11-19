import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { BehaviorSubject, merge, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { RELOAD_TIMEOUT } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { AlertService } from 'src/app/services/alert.service';
import { LogService, LogsResponse } from 'src/app/services/log.service';

@Component({
  selector: 'app-list-logs',
  templateUrl: './list-logs.component.html',
  styleUrls: ['./list-logs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListLogsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  logs: LogsResponse;

  filterForm = new FormGroup({
    filter: new FormControl(null)
  });

  pageSizes = [3, 5, 10, 15];
  defaultPageSize = this.pageSizes[1];
  loading$ = new BehaviorSubject(true);

  private _filter$ = new Subject<void>();
  private _destroy$ = new Subject<void>();

  constructor(private _logService: LogService, private _alertService: AlertService, private _cd: ChangeDetectorRef) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    merge(this.paginator.initialized, this.paginator.page, this._filter$)
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        this.loadPage();
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  applyFilter(): void {
    this._filter$.next();
  }

  cancelFilter(): void {
    this.filterForm.reset();
    this.applyFilter();
  }

  loadPage(): void {
    const { filter } = this.filterForm.value as Record<string, string>;
    const offset = this.paginator.pageSize * this.paginator.pageIndex;
    this._fetchLogs(offset, this.paginator.pageSize, filter ?? '');
    this._cd.detectChanges();
  }

  /**
   * Refreshes table data with a small time-out to simulate loading data even if data gets
   * loaded almost instantly.
   */
  refreshData(): void {
    this.loading$.next(true);

    setTimeout(() => {
      this.loadPage();
    }, RELOAD_TIMEOUT);
  }

  private _fetchLogs(offset = 0, limit = 0, filter = ''): void {
    this.loading$.next(true);

    this._logService
      .fetchItems(offset, limit, filter)
      .pipe(first())
      .subscribe({
        next: logs => {
          this.logs = logs;
          this.paginator.length = logs.count;
          this.loading$.next(false);
        },
        error: () => {
          this.loading$.next(false);
          this._alertService.showError('An error occured during loading logs.');
        }
      });
  }
}
