import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { ThemeService } from 'src/app/services/theme.service';
import { DependencyGraph } from '../../classes/dependency-graph/dependency-graph';
import { NodeNameNotUniqueError } from '../../classes/dependency-graph/errors/node-name-not-unique.error';
import { NodeManager } from '../../classes/dependency-graph/node-manager';
import { GraphNode } from '../../classes/dependency-graph/node/graph-node';
import { DependencyGraphManagerService, DepGraphRef } from '../../services/dependency-graph-manager.service';
import { TcRoutingService } from '../../services/tc-routing.service';

@Component({
  selector: 'app-graph-node-dispenser',
  templateUrl: './graph-node-dispenser.component.html',
  styleUrls: ['./graph-node-dispenser.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphNodeDispenserComponent implements OnInit, OnDestroy {
  @Input() depGraphRef: DepGraphRef = DepGraphRef.STAGE_CREATION;
  dispenser$: Observable<GraphNode[]>;

  private _destroy$ = new Subject<void>();
  private _nodeManager: NodeManager;

  constructor(
    public themeService: ThemeService,
    private _graphManager: DependencyGraphManagerService,
    private _tcRouter: TcRoutingService,
    private _alert: AlertService
  ) {}

  ngOnInit(): void {
    this._graphManager
      .getCurrentGraph(this.depGraphRef)
      .pipe(takeUntil(this._destroy$))
      .subscribe((depGraph: DependencyGraph) => {
        this._createNodeManagerSub(depGraph);
        this._nodeManager = depGraph.graphNodeManager;
        this.dispenser$ = this._graphManager.observeDispenser(this.depGraphRef);
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
  swapNode(node: GraphNode): void {
    try {
      this._nodeManager.addNode(node);
      this._graphManager.removeDispenserNode(this.depGraphRef, node);
    } catch (e) {
      if (e instanceof NodeNameNotUniqueError) {
        this._alert.showError(e.message);
      }
    }
  }

  editNode(node: GraphNode): void {
    this._graphManager.editNode(this.depGraphRef, node);

    const creationStepIndex = this.depGraphRef === DepGraphRef.TEMPLATE_CREATION ? 2 : 1;
    this._tcRouter.navigateTo(creationStepIndex);
  }

  deleteNode(node: GraphNode): void {
    this._graphManager
      .observeNodeEdit(this.depGraphRef)
      .pipe(first())
      .subscribe(editeNode => {
        if (editeNode && editeNode === node) {
          this._graphManager.editNode(this.depGraphRef, null);
        }
      });
    this._graphManager.removeDispenserNode(this.depGraphRef, node);
  }

  private _createNodeManagerSub(depGraph: DependencyGraph): void {
    depGraph.graphNodeManager.moveToDispenser$.pipe(takeUntil(this._destroy$)).subscribe(node => {
      this._graphManager.addDispenserNode(this.depGraphRef, node);
    });
  }
}
