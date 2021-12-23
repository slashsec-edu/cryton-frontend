import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DependencyGraph } from '../classes/dependency-graph/dependency-graph';
import { GraphNode } from '../classes/dependency-graph/node/graph-node';
import { NodeType } from '../models/enums/node-type';

export enum DepGraphRef {
  STAGE_CREATION,
  TEMPLATE_CREATION
}

@Injectable({
  providedIn: 'root'
})
export class DependencyGraphManagerService implements OnDestroy {
  private _currentGraphs: Record<string, BehaviorSubject<DependencyGraph>> = {};
  private _graphsBackup: Record<string, DependencyGraph> = {};
  private _dispensers: Record<string, BehaviorSubject<GraphNode[]>> = {};
  private _editNodeSubjects: Record<string, ReplaySubject<GraphNode>> = {};
  private _editNodeSubscriptions: Record<string, Subscription> = {};
  private _destroy$ = new Subject<void>();

  constructor() {
    this._initialize();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Sets current graph to a given graph or
   * creates new behavior subject at a given
   * dependency graph reference if it doesn't exist.
   *
   * @param key Dependency graph reference.
   * @param depGraph New dependency graph.
   */
  setCurrentGraph(key: DepGraphRef, depGraph: DependencyGraph): void {
    const currentGraph$ = this._currentGraphs[key];

    if (currentGraph$) {
      currentGraph$.next(depGraph);
    } else {
      this._currentGraphs[key] = new BehaviorSubject(depGraph);
    }
    this._observeGraphNodeEdit(depGraph.graphNodeManager.editNode$, key);
  }

  /**
   * Gets current graph behavior subject.
   *
   * @param key Dependency graph reference.
   * @returns Curren graph behavior subject.
   */
  getCurrentGraph(key: DepGraphRef): BehaviorSubject<DependencyGraph> {
    return this._currentGraphs[key];
  }

  /**
   * Resets graph behavior subject to empty graph.
   *
   * @param key Dependency graph reference.
   */
  resetCurrentGraph(key: DepGraphRef): void {
    const currentGraph$ = this.getCurrentGraph(key);
    this.setCurrentGraph(key, new DependencyGraph(currentGraph$.value.nodeType));
  }

  /**
   * Restores graph from backup.
   *
   * @param key Dependency graph reference.
   */
  restoreGraph(key: DepGraphRef): void {
    this.setCurrentGraph(key, this._graphsBackup[key]);
    this._graphsBackup[key] = null;
  }

  /**
   * Backs up current graph and sets current graph to a copy of edited graph.
   *
   * @param key Dependency graph reference.
   * @param depGraph Edited graph.
   * @param backup Current graph will be backed up if true.
   */
  editGraph(key: DepGraphRef, depGraph: DependencyGraph, backup = true): void {
    if (backup) {
      this._graphsBackup[key] = this.getCurrentGraph(key).value;
    } else {
      this.getCurrentGraph(key).value.destroy();
      this._graphsBackup[key] = new DependencyGraph(this._currentGraphs[key].value.nodeType);
    }

    this.setCurrentGraph(key, depGraph.copy());
  }

  /**
   * Resets dependency graph manager to default state.
   */
  reset(): void {
    this._graphsBackup = {};
    Object.values(this._editNodeSubscriptions).forEach(sub => sub.unsubscribe());
    Object.values(this._editNodeSubjects).forEach(subject => subject.next(null));
    this._forEachKey((key: DepGraphRef) => this.resetCurrentGraph(key));
  }

  addDispenserNode(key: DepGraphRef, node: GraphNode): void {
    const nodes = this._dispensers[key].value;
    nodes.push(node);
    this._dispensers[key].next(nodes);
  }

  removeDispenserNode(key: DepGraphRef, node: GraphNode): void {
    const nodes = this._dispensers[key].value;
    const index = nodes.indexOf(node);

    if (index !== -1) {
      nodes.splice(index, 1);
    }
    this._dispensers[key].next(nodes);
  }

  observeDispenser(key: DepGraphRef): Observable<GraphNode[]> {
    return this._dispensers[key].asObservable();
  }

  observeNodeEdit(key: DepGraphRef): Observable<GraphNode> {
    return this._editNodeSubjects[key].asObservable();
  }

  editNode(key: DepGraphRef, node: GraphNode | null): void {
    this._editNodeSubjects[key].next(node);
  }

  getDispenserNodes(key: DepGraphRef): GraphNode[] {
    return this._dispensers[key].value;
  }

  refreshDispenser(key: DepGraphRef): void {
    this._dispensers[key].next(this.getDispenserNodes(key));
  }

  /**
   * Initializes graph behavior subjects with empty graphs.
   */
  private _initialize(): void {
    this._forEachKey(key => {
      this._dispensers[key] = new BehaviorSubject<GraphNode[]>([]);
      this._editNodeSubjects[key] = new ReplaySubject<GraphNode>(1);
    });
    this._initializeGraphs();
  }

  private _initializeGraphs(): void {
    this._createGraph(DepGraphRef.STAGE_CREATION);
    this._createGraph(DepGraphRef.TEMPLATE_CREATION);
  }

  private _createGraph(key: DepGraphRef): void {
    const depGraph = new DependencyGraph(
      key === DepGraphRef.STAGE_CREATION ? NodeType.CRYTON_STEP : NodeType.CRYTON_STAGE
    );
    this.setCurrentGraph(key, depGraph);
  }

  private _observeGraphNodeEdit(graphEditNode$: Observable<GraphNode>, key: DepGraphRef): void {
    const editNode$ = this._editNodeSubjects[key];
    const currentSubscription = this._editNodeSubscriptions[key];

    if (currentSubscription) {
      currentSubscription.unsubscribe();
    }

    editNode$.next(null);
    this._editNodeSubscriptions[key] = graphEditNode$.pipe(takeUntil(this._destroy$)).subscribe(node => {
      editNode$.next(node);
    });
  }

  private _forEachKey(func: (key: DepGraphRef) => void): void {
    Object.keys(DepGraphRef)
      .filter(val => !isNaN(Number(val)))
      .forEach(key => func((key as unknown) as DepGraphRef));
  }
}
