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
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, first, takeUntil, tap } from 'rxjs/operators';
import { Report } from 'src/app/models/api-responses/report/report.interface';
import { TickSizePickerComponent } from 'src/app/modules/shared/components/tick-size-picker/tick-size-picker.component';
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

  display: typeof Display = Display;
  currentDisplay = Display.LOADING;
  colorMap = Object.entries(FILL_MAP);
  report: Report;
  runID: number;
  timeline: ReportTimeline;

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
    this.runID = parseInt(this._route.snapshot.paramMap.get('id'), 10);
    this.timeline = new ReportTimeline();
    this._createResizeSub();
  }

  ngAfterViewInit(): void {
    this._createReportSub();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  changeExecution(e: PageEvent): void {
    this.timeline.clear();
    this.timeline.renderExecution(this.report.plan_executions[e.pageIndex]);
    this.tickSizePicker.tickSeconds = this.timeline.tickSeconds;
  }

  openHelp(): void {
    this._dialog.open(ReportTimelineHelpComponent, { width: '60%' });
  }

  private _createResizeSub(): void {
    this._resizeService.sidenavResize$
      .pipe(delay(100), takeUntil(this._destroy$))
      .subscribe(() => this.timeline.updateDimensions());
  }

  private _createReportSub(): void {
    this._runService
      .fetchReport(this.runID)
      .pipe(
        tap(report => {
          if (report.start_time) {
            this.currentDisplay = Display.DEFAULT;
          } else {
            this.currentDisplay = Display.NOT_STARTED;
          }
          this.report = report;
          this._cd.detectChanges();
        }),
        delay(50),
        first()
      )
      .subscribe({
        next: report => {
          if (report.start_time) {
            this._initTimeline(report);
          }
        },
        error: () => {
          this.currentDisplay = Display.ERROR;
          this._cd.detectChanges();
        }
      });
  }

  private _initTimeline(report: Report): void {
    this.timeline.initKonva(this.timelineContainer.nativeElement, this._themeService.currentTheme$);
    this.timeline.renderExecution(report.plan_executions[0]);
    this.tickSizePicker.tickSeconds = this.timeline.tickSeconds;
  }
}
