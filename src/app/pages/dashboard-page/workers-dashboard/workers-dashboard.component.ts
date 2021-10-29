import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { WorkersService } from 'src/app/services/workers.service';
import { Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { tap, takeUntil, takeWhile } from 'rxjs/operators';
import { trigger, transition, useAnimation, query, stagger, style } from '@angular/animations';
import { renderComponentAnimation } from 'src/app/modules/shared/animations/render-component.animation';
import { WorkersDashboardDataSource } from 'src/app/models/data-sources/workers-dahboard.data-source';

@Component({
  selector: 'app-workers-dashboard',
  templateUrl: './workers-dashboard.component.html',
  styleUrls: ['./workers-dashboard.component.scss'],
  animations: [
    trigger('renderTrigger', [
      transition('loading => loaded', [
        query('.worker', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(30, [useAnimation(renderComponentAnimation)])
        ])
      ])
    ])
  ]
})
export class WorkersDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;

  dataSource = new WorkersDashboardDataSource(this._workersService);
  firstWorkersLoaded = false;

  private _pageSize = 4;
  private _destroy$ = new Subject<void>();

  constructor(private _workersService: WorkersService) {}

  /**
   * Sets the firstWorkersLoaded variable to true when
   * the first page of workers gets loaded for proper render animation.
   */
  ngOnInit(): void {
    this.dataSource.dataSubject$.pipe(takeWhile(() => !this.firstWorkersLoaded)).subscribe(data => {
      if (data && data.length > 0) {
        this.firstWorkersLoaded = true;
      }
    });
    this.dataSource.loadItems(0, this._pageSize);
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
    this.dataSource.loadItems(this.paginator.pageIndex * this.paginator.pageSize, this.paginator.pageSize);
  }
}