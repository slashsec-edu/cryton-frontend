import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DebugElement,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, delay, first, takeUntil, tap } from 'rxjs/operators';
import { Report } from 'src/app/models/api-responses/report/report.interface';
import { StageExecutionReport } from 'src/app/models/api-responses/report/stage-execution-report.interface';
import { StepExecutionReport } from 'src/app/models/api-responses/report/step-execution-report.interface';
import { TickSizePickerComponent } from 'src/app/modules/shared/components/tick-size-picker/tick-size-picker.component';
import { NodeType } from 'src/app/modules/template-creator/models/enums/node-type';
import { ResizeService } from 'src/app/services/resize.service';
import { RunService } from 'src/app/services/run.service';
import { ThemeService } from 'src/app/services/theme.service';
import { FILL_MAP } from '../../classes/report-constants';
import { ReportTimeline } from '../../classes/report-timeline';
import { ReportTimelineHelpComponent } from '../report-timeline-help/report-timeline-help.component';

export enum Display {
  LOADING,
  ERROR,
  NOT_STARTED,
  DEFAULT
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss', '../../../template-creator/styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('timelineContainer') timelineContainer: DebugElement;
  @ViewChild(TickSizePickerComponent) tickSizePicker: TickSizePickerComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  display: typeof Display = Display;
  currentDisplay = Display.LOADING;
  colorMap = Object.entries(FILL_MAP);
  report: Report;
  runID: number;
  timeline: ReportTimeline;
  NodeType = NodeType;

  maxTooltipTextLength = 30;

  private _destroy$ = new Subject<void>();

  constructor(
    private _route: ActivatedRoute,
    private _runService: RunService,
    private _themeService: ThemeService,
    private _resizeService: ResizeService,
    private _cd: ChangeDetectorRef,
    private _dialog: MatDialog
  ) {}

  /**
   * Resizes canvas on window resize
   */
  @HostListener('window:resize') onResize(): void {
    this.timeline.updateDimensions();
  }

  ngOnInit(): void {
    this.runID = Number(this._route.snapshot.paramMap.get('id'));
    this.timeline = new ReportTimeline();
    this._createResizeSub();
    // this._createExecutionDataSub();
  }

  ngAfterViewInit(): void {
    this._loadReport();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  changeExecution(e: PageEvent): void {
    this.timeline.destroy();
    this.timeline = new ReportTimeline();
    this._initTimeline(this.report, e.pageIndex);
  }

  openHelp(): void {
    this._dialog.open(ReportTimelineHelpComponent, { width: '60%' });
  }

  refresh(): void {
    this._fetchReport().subscribe(report => {
      this.timeline.updateExecution(report.plan_executions[this.paginator.pageIndex]);
      this.tickSizePicker.tickSeconds = this.timeline.tickSeconds;
    });
  }

  asStageReport(data: StageExecutionReport | StepExecutionReport): StageExecutionReport {
    return data as StageExecutionReport;
  }

  asStepReport(data: StageExecutionReport | StepExecutionReport): StepExecutionReport {
    return data as StepExecutionReport;
  }

  private _createResizeSub(): void {
    this._resizeService.sidenavResize$
      .pipe(delay(200), takeUntil(this._destroy$))
      .subscribe(() => this.timeline.updateDimensions());
  }

  private _loadReport(): void {
    this._fetchReport().subscribe(report => {
      if (report.start_time) {
        this._initTimeline(report);
      }
    });
  }

  private _fetchReport(): Observable<Report> {
    return this._runService.fetchReport(this.runID).pipe(
      tap(report => {
        if (report.start_time) {
          this.currentDisplay = Display.DEFAULT;
        } else {
          this.currentDisplay = Display.NOT_STARTED;
        }
        this.report = report;
        this._cd.detectChanges();
      }),
      catchError(err => {
        this.currentDisplay = Display.ERROR;
        this._cd.detectChanges();
        return throwError(() => new Error(err));
      }),
      delay(50),
      first()
    );
  }

  private _initTimeline(report: Report, executionIndex = 0): void {
    this.timeline.initKonva(this.timelineContainer.nativeElement as HTMLDivElement, this._themeService.currentTheme$);
    this.timeline.renderExecution(report.plan_executions[executionIndex]);
    this.tickSizePicker.tickSeconds = this.timeline.tickSeconds;
  }
}
