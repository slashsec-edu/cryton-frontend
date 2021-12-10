import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { ThemeService } from 'src/app/services/theme.service';
import { takeUntil } from 'rxjs/operators';
import { TreeNode } from '../../classes/dependency-tree/node/tree-node';

@Component({
  selector: 'app-tree-node-dispenser',
  templateUrl: './tree-node-dispenser.component.html',
  styleUrls: ['./tree-node-dispenser.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeNodeDispenserComponent implements OnInit, OnDestroy {
  @Input() depTreeRef: DepTreeRef = DepTreeRef.STAGE_CREATION;

  nodeSubject$: Observable<TreeNode[]>;

  private _destroy$ = new Subject<void>();
  private _nodeManager: NodeManager;

  constructor(private _treeManager: DependencyTreeManagerService, public themeService: ThemeService) {}

  ngOnInit(): void {
    this._treeManager
      .getCurrentTree(this.depTreeRef)
      .pipe(takeUntil(this._destroy$))
      .subscribe((depTree: DependencyTree) => {
        this._nodeManager = depTree.treeNodeManager;
        this.nodeSubject$ = depTree.treeNodeManager.dispenserNodes$;
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
    this._nodeManager.moveToPlan(node);
  }
}
