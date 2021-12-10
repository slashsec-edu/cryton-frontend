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
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { Alert } from 'src/app/modules/shared/models/interfaces/alert.interface';
import { MatDialog } from '@angular/material/dialog';
import { EdgeParametersComponent } from '../edge-parameters/edge-parameters.component';
import { AlertService } from 'src/app/services/alert.service';
import { ThemeService } from 'src/app/services/theme.service';
import { TreeEdge } from '../../classes/dependency-tree/edge/tree-edge';
import { StepEdge } from '../../classes/dependency-tree/edge/step-edge';
import { DependencyTreeHelpComponent } from '../dependency-tree-help/dependency-tree-help.component';
import { NavigationButton } from '../../models/interfaces/navigation-button';
import { TcRoutingService } from '../../services/tc-routing.service';

@Component({
  selector: 'app-dependency-tree-editor',
  templateUrl: './dependency-tree-editor.component.html',
  styleUrls: ['./dependency-tree-editor.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyTreeEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() nodeName: string;
  @Input() depTreeRef: DepTreeRef = DepTreeRef.STAGE_CREATION;
  @Input() navigationButtons?: NavigationButton[];
  @ViewChild('container') canvasContainer: DebugElement;
  @Output() navigate = new EventEmitter<string>();

  depTree: DependencyTree;
  private _destroy$ = new Subject<void>();

  constructor(
    private _treeManager: DependencyTreeManagerService,
    private _dialog: MatDialog,
    private _alertService: AlertService,
    private _themeService: ThemeService,
    private _tcRouter: TcRoutingService
  ) {}

  get isSwapEnabled(): boolean {
    return this.depTree.toolState.isSwapEnabled;
  }

  get isDeleteEnabled(): boolean {
    return this.depTree.toolState.isDeleteEnabled;
  }

  get isMoveNodeEnabled(): boolean {
    return this.depTree.toolState.isMoveNodeEnabled;
  }

  /**
   * Resizes canvas on window resize
   */
  @HostListener('window:resize') onResize(): void {
    this.depTree.updateDimensions();
  }

  ngOnInit(): void {
    this._createAlertSub();
    this._createEditEdgeSub();

    this._treeManager
      .getCurrentTree(this.depTreeRef)
      .pipe(takeUntil(this._destroy$))
      .subscribe(depTree => (this.depTree = depTree));
  }

  ngAfterViewInit(): void {
    this._createDepTreeSub();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  showHelp(): void {
    this._dialog.open(DependencyTreeHelpComponent, { width: '60%' });
  }

  navigateTo(componentName: string): void {
    this.navigate.emit(componentName);
  }

  navigateToNodeEditor(): void {
    if (this.depTreeRef === DepTreeRef.STAGE_CREATION) {
      this._tcRouter.navigateTo(1);
    } else {
      this._tcRouter.navigateTo(2, 'stage_params');
    }
  }

  /**
   * Subscribes to the tree behavior subject.
   *
   * On every next():
   * - Initializes dependency tree inside the canvas container.
   */
  private _createDepTreeSub(): void {
    const theme$ = this._themeService.currentTheme$;

    this._treeManager
      .getCurrentTree(this.depTreeRef)
      .pipe(
        takeUntil(this._destroy$),
        tap(depTree => {
          depTree.initKonva(this.canvasContainer.nativeElement, theme$);
          depTree.cursorState.container = this.canvasContainer.nativeElement as HTMLDivElement;
          depTree.fitScreen();
        }),
        switchMap(depTree => depTree.treeNodeManager.editNode$)
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
    StepEdge.editEdge$.pipe(takeUntil(this._destroy$)).subscribe((edge: TreeEdge) => {
      this._dialog.open(EdgeParametersComponent, { data: { edge } });
    });
  }

  /**
   * Subscribes to alert observable from the current dependency tree.
   *
   * On every next:
   * - Emits new alert from the alert service.
   */
  private _createAlertSub(): void {
    this._treeManager
      .getCurrentTree(this.depTreeRef)
      .pipe(
        mergeMap(depTree => depTree.alert$),
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
