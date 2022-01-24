import {
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  AfterViewInit,
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  DebugElement
} from '@angular/core';
import { Subject } from 'rxjs';
import { mergeMap, switchMap, takeUntil, tap } from 'rxjs/operators';
import { DependencyGraph } from '../../classes/dependency-graph/dependency-graph';
import { DependencyGraphManagerService, DepGraphRef } from '../../services/dependency-graph-manager.service';
import { Alert } from 'src/app/modules/shared/models/interfaces/alert.interface';
import { MatDialog } from '@angular/material/dialog';
import { EdgeParametersComponent } from '../edge-parameters/edge-parameters.component';
import { AlertService } from 'src/app/services/alert.service';
import { ThemeService } from 'src/app/services/theme.service';
import { GraphEdge } from '../../classes/dependency-graph/edge/graph-edge';
import { StepEdge } from '../../classes/dependency-graph/edge/step-edge';
import { DependencyGraphHelpComponent } from '../../pages/help-pages/dependency-graph-help/dependency-graph-help.component';
import { NavigationButton } from '../../models/interfaces/navigation-button';
import { TcRoutingService } from '../../services/tc-routing.service';

@Component({
  selector: 'app-dependency-graph-editor',
  templateUrl: './dependency-graph-editor.component.html',
  styleUrls: ['./dependency-graph-editor.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyGraphEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() nodeName: string;
  @Input() depGraphRef: DepGraphRef = DepGraphRef.STAGE_CREATION;
  @Input() navigationButtons?: NavigationButton[];
  @ViewChild('container') canvasContainer: DebugElement;
  @Output() navigate = new EventEmitter<string>();

  depGraph: DependencyGraph;
  private _destroy$ = new Subject<void>();

  constructor(
    private _graphManager: DependencyGraphManagerService,
    private _dialog: MatDialog,
    private _alertService: AlertService,
    private _themeService: ThemeService,
    private _tcRouter: TcRoutingService
  ) {}

  get isSwapEnabled(): boolean {
    return this.depGraph.toolState.isSwapEnabled;
  }

  get isDeleteEnabled(): boolean {
    return this.depGraph.toolState.isDeleteEnabled;
  }

  get isMoveNodeEnabled(): boolean {
    return this.depGraph.toolState.isMoveNodeEnabled;
  }

  /**
   * Resizes canvas on window resize
   */
  @HostListener('window:resize') onResize(): void {
    this.depGraph.updateDimensions();
  }

  ngOnInit(): void {
    this._createAlertSub();
    this._createEditEdgeSub();

    this._graphManager
      .getCurrentGraph(this.depGraphRef)
      .pipe(takeUntil(this._destroy$))
      .subscribe(depGraph => (this.depGraph = depGraph));
  }

  ngAfterViewInit(): void {
    this._createDepGraphSub();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  showHelp(): void {
    this._dialog.open(DependencyGraphHelpComponent, { width: '60%' });
  }

  navigateTo(componentName: string): void {
    this.navigate.emit(componentName);
  }

  navigateToNodeEditor(): void {
    if (this.depGraphRef === DepGraphRef.STAGE_CREATION) {
      this._tcRouter.navigateTo(1);
    } else {
      this._tcRouter.navigateTo(2, 'stage_params');
    }
  }

  /**
   * Subscribes to the graph behavior subject.
   *
   * On every next():
   * - Initializes dependency graph inside the canvas container.
   */
  private _createDepGraphSub(): void {
    const theme$ = this._themeService.currentTheme$;

    this._graphManager
      .getCurrentGraph(this.depGraphRef)
      .pipe(
        takeUntil(this._destroy$),
        tap(depGraph => {
          depGraph.initKonva(this.canvasContainer.nativeElement, theme$);
          depGraph.cursorState.container = this.canvasContainer.nativeElement as HTMLDivElement;
          depGraph.fitScreen();
        }),
        switchMap(depGraph => depGraph.graphNodeManager.editNode$)
      )
      .subscribe(node => {
        if (node) {
          this.navigateToNodeEditor();
        }
      });
  }

  /**
   * Subscribes to the edit cryton step edge subject
   *
   * On every next():
   * - Opens edge parameters dialog window.
   */
  private _createEditEdgeSub(): void {
    StepEdge.editEdge$.pipe(takeUntil(this._destroy$)).subscribe((edge: GraphEdge) => {
      this._dialog.open(EdgeParametersComponent, { width: '90%', maxWidth: '600px', data: { edge } });
    });
  }

  /**
   * Subscribes to alert observable from the current dependency graph.
   *
   * On every next:
   * - Emits new alert from the alert service.
   */
  private _createAlertSub(): void {
    this._graphManager
      .getCurrentGraph(this.depGraphRef)
      .pipe(
        mergeMap(depGraph => depGraph.alert$),
        takeUntil(this._destroy$)
      )
      .subscribe((alert: Alert) => {
        switch (alert.type) {
          case 'error':
            this._alertService.showError(alert.message);
            break;
          case 'warning':
            this._alertService.showWarning(alert.message);
            break;
          case 'success':
            this._alertService.showSuccess(alert.message);
            break;
          default:
            throw new Error('Invalid alert type.');
        }
      });
  }
}
