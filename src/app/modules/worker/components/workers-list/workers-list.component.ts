import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { WorkersService } from 'src/app/services/workers.service';
import { Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { tap, takeUntil } from 'rxjs/operators';
import { trigger, transition, useAnimation, query, stagger, style } from '@angular/animations';
import { renderComponentAnimation } from 'src/app/modules/shared/animations/render-component.animation';
import { WorkersDashboardDataSource } from 'src/app/models/data-sources/workers-dahboard.data-source';
import { RELOAD_TIMEOUT } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { TableDataSource } from 'src/app/generics/table.datasource';
import { Worker } from 'src/app/models/api-responses/worker.interface';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.scss'],
  animations: [
    trigger('renderTrigger', [
      transition('loading => loaded', [
        query(
          '.worker',
          [style({ opacity: 0, transform: 'translateY(20px)' }), stagger(30, [useAnimation(renderComponentAnimation)])],
          { optional: true }
        )
      ])
    ])
  ]
})
export class WorkersListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() dataSource: TableDataSource<Worker> = new WorkersDashboardDataSource(this._workersService);
  @Input() clickableWorkers = false;
  @Output() workerClick = new EventEmitter<Worker>();
  pageSize = 4;

  private _destroy$ = new Subject<void>();
  constructor(private _workersService: WorkersService) {}

  /**
   * Sets the firstWorkersLoaded variable to true when
   * the first page of workers gets loaded for proper render animation.
   */
  ngOnInit(): void {
    this.dataSource.loadItems(0, this.pageSize, null, null);
  }

  ngAfterViewInit(): void {
    this.paginator.page
      .pipe(
        tap(() => this.loadWorkers()),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  loadWorkers(): void {
    const offset = this.paginator ? this.paginator.pageIndex * this.paginator.pageSize : 0;
    this.dataSource.loadItems(offset, this.pageSize, null, null);
  }

  /**
   * Refreshes table data with a small time-out to simulate loading data even if data gets
   * loaded almost instantly.
   */
  refreshData(): void {
    this.dataSource.setLoading(true);

    setTimeout(() => {
      this.loadWorkers();
    }, RELOAD_TIMEOUT);
  }
}
