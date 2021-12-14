import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { ThemeService } from 'src/app/services/theme.service';
import { takeUntil } from 'rxjs/operators';
import { TreeNode } from '../../classes/dependency-tree/node/tree-node';
import { TcRoutingService } from '../../services/tc-routing.service';
import { NodeNameNotUniqueError } from '../../classes/dependency-tree/errors/node-name-not-unique.error';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-tree-node-dispenser',
  templateUrl: './tree-node-dispenser.component.html',
  styleUrls: ['./tree-node-dispenser.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeDispenserComponent implements OnInit, OnDestroy {
  @Input() depTreeRef: DepTreeRef = DepTreeRef.STAGE_CREATION;
  dispenser$: Observable<TreeNode[]>;

  private _destroy$ = new Subject<void>();
  private _nodeManager: NodeManager;

  constructor(
    public themeService: ThemeService,
    private _treeManager: DependencyTreeManagerService,
    private _tcRouter: TcRoutingService,
    private _alert: AlertService
  ) {}

  ngOnInit(): void {
    this._treeManager
      .getCurrentTree(this.depTreeRef)
      .pipe(takeUntil(this._destroy$))
      .subscribe((depTree: DependencyTree) => {
        this._createNodeManagerSub(depTree);
        this._nodeManager = depTree.treeNodeManager;
        this.dispenser$ = this._treeManager.observeDispenser(this.depTreeRef);
      });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Swaps node from dispenser to canvas.
   *
   * @param node Node to swap.
   */
  swapNode(node: TreeNode): void {
    try {
      this._nodeManager.addNode(node);
      this._treeManager.removeDispenserNode(this.depTreeRef, node);
    } catch (e) {
      if (e instanceof NodeNameNotUniqueError) {
        this._alert.showError(e.message);
      }
    }
  }

  editNode(node: TreeNode): void {
    this._treeManager.editNode(this.depTreeRef, node);

    const creationStepIndex = this.depTreeRef === DepTreeRef.TEMPLATE_CREATION ? 2 : 1;
    this._tcRouter.navigateTo(creationStepIndex);
  }

  private _createNodeManagerSub(depTree: DependencyTree): void {
    depTree.treeNodeManager.moveToDispenser$.pipe(takeUntil(this._destroy$)).subscribe(node => {
      this._treeManager.addDispenserNode(this.depTreeRef, node);
    });
  }
}
