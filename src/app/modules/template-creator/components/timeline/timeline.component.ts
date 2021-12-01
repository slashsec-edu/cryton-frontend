import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DebugElement,
  EventEmitter,
  HostListener,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { TickSizePickerComponent } from 'src/app/modules/shared/components/tick-size-picker/tick-size-picker.component';
import { ResizeService } from 'src/app/services/resize.service';
import { ThemeService } from 'src/app/services/theme.service';
import { TemplateTimeline } from '../../classes/timeline/template-timeline';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { TemplateTimelineHelpComponent } from '../template-timeline-help/template-timeline-help.component';
import { TimelineNodeParametersComponent } from '../timeline-node-parameters/timeline-node-parameters.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss', '../../models/styles/responsive-height.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container') canvasContainer: DebugElement;
  @ViewChild(TickSizePickerComponent) tickSizePicker: TickSizePickerComponent;
  @Output() swapPages = new EventEmitter<void>();

  private _destroy$ = new Subject<void>();

  get timeline(): TemplateTimeline {
    return this._state.timeline;
  }

  get isVerticalMoveEnabled(): boolean {
    return this.timeline.toolState.isVerticalMoveEnabled;
  }

  get isTreeMoveEnabled(): boolean {
    return this.timeline.toolState.isTreeMoveEnabled;
  }

  constructor(
    private _state: TemplateCreatorStateService,
    private _dialog: MatDialog,
    private _themeService: ThemeService,
    private _resizeService: ResizeService,
    private _cd: ChangeDetectorRef
  ) {}

  /**
   * Resizes canvas on window resize
   */
  @HostListener('window:resize') onResize(): void {
    this.timeline.updateDimensions();
  }

  ngOnInit(): void {
    this._createOpenParamsSub();
    this._createResizeSub();
  }

  ngAfterViewInit(): void {
    this._state.timeline.initKonva(this.canvasContainer.nativeElement, this._themeService.currentTheme$);
    this.timeline.updateDimensions();
    this._updateTickSize();
    this._cd.detectChanges();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Emits swap pages event for switching tab back to build template tab.
   */
  emitSwapPagesEvent(): void {
    this.swapPages.emit();
  }

  openHelp(): void {
    this._dialog.open(TemplateTimelineHelpComponent, { width: '60%' });
  }

  /**
   * Subscribes to openNodeParams subject in timeline.
   *
   * On every next():
   * - Opens timeline node parameters dialog window.
   */
  private _createOpenParamsSub(): void {
    this.timeline.openNodeParams$.pipe(takeUntil(this._destroy$)).subscribe(stage => {
      this._dialog.open(TimelineNodeParametersComponent, { data: { stage } });
    });
  }

  private _createResizeSub(): void {
    this._resizeService.sidenavResize$
      .pipe(delay(100), takeUntil(this._destroy$))
      .subscribe(() => this.timeline.updateDimensions());
  }

  private _updateTickSize(): void {
    this.tickSizePicker.tickSeconds = this.timeline.tickSeconds;
  }
}
