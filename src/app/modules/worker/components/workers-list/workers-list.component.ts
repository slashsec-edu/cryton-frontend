import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { TableDataSource } from 'src/app/generics/table.datasource';
import { Worker } from 'src/app/models/api-responses/worker.interface';
import { WorkersDashboardDataSource } from 'src/app/models/data-sources/workers-dahboard.data-source';
import { stagedRenderTrigger } from 'src/app/modules/shared/animations/staged-render.animation';
import { WorkersService } from 'src/app/services/workers.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-workers-list',
  templateUrl: './workers-list.component.html',
  styleUrls: ['./workers-list.component.scss'],
  animations: [stagedRenderTrigger('.worker')]
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
    }, environment.refreshDelay);
  }
}
