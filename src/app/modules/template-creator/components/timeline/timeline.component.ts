import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DebugElement,
  EventEmitter,
  HostListener,
  Input,
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
import { NavigationButton } from '../../models/interfaces/navigation-button';
import { TemplateTimelineHelpComponent } from '../../pages/help-pages/template-timeline-help/template-timeline-help.component';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { TimelineNodeParametersComponent } from '../timeline-node-parameters/timeline-node-parameters.component';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('container') canvasContainer: DebugElement;
  @ViewChild(TickSizePickerComponent) tickSizePicker: TickSizePickerComponent;
  @Output() navigate = new EventEmitter<string>();
  @Input() navigationButtons?: NavigationButton[];

  private _destroy$ = new Subject<void>();

  constructor(
    private _state: TemplateCreatorStateService,
    private _dialog: MatDialog,
    private _themeService: ThemeService,
    private _resizeService: ResizeService,
    private _cd: ChangeDetectorRef
  ) {}

  get timeline(): TemplateTimeline {
    return this._state.timeline;
  }

  get isVerticalMoveEnabled(): boolean {
    return this.timeline.toolState.isVerticalMoveEnabled;
  }

  get isGraphMoveEnabled(): boolean {
    return this.timeline.toolState.isGraphMoveEnabled;
  }

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
    this._state.timeline.initKonva(
      this.canvasContainer.nativeElement as HTMLDivElement,
      this._themeService.currentTheme$
    );
    this.timeline.updateDimensions();
    this._updateTickSize();
    this._cd.detectChanges();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  navigateTo(componentName: string): void {
    this.navigate.emit(componentName);
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
      .pipe(delay(200), takeUntil(this._destroy$))
      .subscribe(() => this.timeline.updateDimensions());
  }

  private _updateTickSize(): void {
    this.tickSizePicker.tickSeconds = this.timeline.tickSeconds;
  }
}
