import {
  DebugElement,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  AfterViewInit,
  Component,
  ViewChild,
  ChangeDetectionStrategy,
  Output,
  EventEmitter
} from '@angular/core';
import { Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { Alert } from 'src/app/modules/shared/models/interfaces/alert.interface';
import { MatDialog } from '@angular/material/dialog';
import { EdgeParametersComponent } from '../edge-parameters/edge-parameters.component';
import { CrytonEdge } from '../../classes/cryton-edge/cryton-edge';
import { CrytonStepEdge } from '../../classes/cryton-edge/cryton-step-edge';
import { AlertService } from 'src/app/services/alert.service';
import { ThemeService } from 'src/app/services/theme.service';

@Component({
  selector: 'app-dependency-tree-editor',
  templateUrl: './dependency-tree-editor.component.html',
  styleUrls: ['./dependency-tree-editor.component.scss', '../../models/styles/responsive-height.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DependencyTreeEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() nodeName: string;
  @Input() depTreeRef: DepTreeRef = DepTreeRef.STAGE_CREATION;

  @ViewChild('container') canvasContainer: DebugElement;

  @Output() swapPages = new EventEmitter<void>();

  depTree: DependencyTree;
  private _destroy$ = new Subject<void>();

  constructor(
    private _treeManager: DependencyTreeManagerService,
    private _dialog: MatDialog,
    private _alertService: AlertService,
    private _themeService: ThemeService
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

  /**
   * Emits swap pages event for swapping back to parent tab.
   */
  emitSwapPagesEvent(): void {
    this.swapPages.emit();
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
      .pipe(takeUntil(this._destroy$))
      .subscribe(depTree => {
        depTree.initKonva('canvas-container', this.canvasContainer, theme$);
        depTree.cursorState.container = this.canvasContainer.nativeElement as HTMLElement;
        depTree.fitScreen();
      });
  }

  /**
   * Subscribes to the edit cryton step edge subject
   *
   * On every next():
   * - Opens edge parameters dialog window.
   */
  private _createEditEdgeSub(): void {
    CrytonStepEdge.editEdge$.pipe(takeUntil(this._destroy$)).subscribe((edge: CrytonEdge) => {
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
