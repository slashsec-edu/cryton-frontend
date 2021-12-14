import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DependencyTree } from '../classes/dependency-tree/dependency-tree';
import { TreeNode } from '../classes/dependency-tree/node/tree-node';
import { NodeType } from '../models/enums/node-type';

export enum DepTreeRef {
  STAGE_CREATION,
  TEMPLATE_CREATION
}

@Injectable({
  providedIn: 'root'
})
export class DependencyTreeManagerService implements OnDestroy {
  private _currentTrees: Record<string, BehaviorSubject<DependencyTree>> = {};
  private _treesBackup: Record<string, DependencyTree> = {};
  private _dispensers: Record<string, BehaviorSubject<TreeNode[]>> = {};
  private _editNodeSubjects: Record<string, ReplaySubject<TreeNode>> = {};
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
   * Sets current tree to a given tree or
   * creates new behavior subject at a given
   * dependency tree reference if it doesn't exist.
   *
   * @param key Dependency tree reference.
   * @param depTree New dependency tree.
   */
  setCurrentTree(key: DepTreeRef, depTree: DependencyTree): void {
    const currentTree$ = this._currentTrees[key];

    if (currentTree$) {
      currentTree$.next(depTree);
    } else {
      this._currentTrees[key] = new BehaviorSubject(depTree);
    }
    this._observeTreeNodeEdit(depTree.treeNodeManager.editNode$, key);
  }

  /**
   * Gets current tree behavior subject.
   *
   * @param key Dependency tree reference.
   * @returns Curren tree behavior subject.
   */
  getCurrentTree(key: DepTreeRef): BehaviorSubject<DependencyTree> {
    return this._currentTrees[key];
  }

  /**
   * Resets tree behavior subject to empty tree.
   *
   * @param key Dependency tree reference.
   */
  resetCurrentTree(key: DepTreeRef): void {
    const currentTree$ = this.getCurrentTree(key);
    this.setCurrentTree(key, new DependencyTree(currentTree$.value.nodeType));
  }

  /**
   * Restores tree from backup.
   *
   * @param key Dependency tree reference.
   */
  restoreTree(key: DepTreeRef): void {
    this.setCurrentTree(key, this._treesBackup[key]);
    this._treesBackup[key] = null;
  }

  /**
   * Backs up current tree and sets current tree to a copy of edited tree.
   *
   * @param key Dependency tree reference.
   * @param depTree Edited tree.
   * @param backup Current tree will be backed up if true.
   */
  editTree(key: DepTreeRef, depTree: DependencyTree, backup = true): void {
    if (backup) {
      this._treesBackup[key] = this.getCurrentTree(key).value;
    } else {
      this.getCurrentTree(key).value.destroy();
      this._treesBackup[key] = new DependencyTree(this._currentTrees[key].value.nodeType);
    }

    this.setCurrentTree(key, depTree.copy());
  }

  /**
   * Resets dependency tree manager to default state.
   */
  reset(): void {
    this._treesBackup = {};
    Object.values(this._editNodeSubscriptions).forEach(sub => sub.unsubscribe());
    Object.values(this._editNodeSubjects).forEach(subject => subject.next(null));
    this._forEachKey((key: DepTreeRef) => this.resetCurrentTree(key));
  }

  addDispenserNode(key: DepTreeRef, node: TreeNode): void {
    const nodes = this._dispensers[key].value;
    nodes.push(node);
    this._dispensers[key].next(nodes);
  }

  removeDispenserNode(key: DepTreeRef, node: TreeNode): void {
    const nodes = this._dispensers[key].value;
    const index = nodes.indexOf(node);

    if (index !== -1) {
      nodes.splice(index, 1);
    }
    this._dispensers[key].next(nodes);
  }

  observeDispenser(key: DepTreeRef): Observable<TreeNode[]> {
    return this._dispensers[key].asObservable();
  }

  observeNodeEdit(key: DepTreeRef): Observable<TreeNode> {
    return this._editNodeSubjects[key].asObservable();
  }

  editNode(key: DepTreeRef, node: TreeNode | null): void {
    this._editNodeSubjects[key].next(node);
  }

  getDispenserNodes(key: DepTreeRef): TreeNode[] {
    return this._dispensers[key].value;
  }

  refreshDispenser(key: DepTreeRef): void {
    this._dispensers[key].next(this.getDispenserNodes(key));
  }

  /**
   * Initializes tree behavior subjects with empty trees.
   */
  private _initialize(): void {
    this._forEachKey(key => {
      this._dispensers[key] = new BehaviorSubject<TreeNode[]>([]);
      this._editNodeSubjects[key] = new ReplaySubject<TreeNode>(1);
    });
    this._initializeTrees();
  }

  private _initializeTrees(): void {
    this._createTree(DepTreeRef.STAGE_CREATION);
    this._createTree(DepTreeRef.TEMPLATE_CREATION);
  }

  private _createTree(key: DepTreeRef): void {
    const depTree = new DependencyTree(
      key === DepTreeRef.STAGE_CREATION ? NodeType.CRYTON_STEP : NodeType.CRYTON_STAGE
    );
    this.setCurrentTree(key, depTree);
  }

  private _observeTreeNodeEdit(treeEditNode$: Observable<TreeNode>, key: DepTreeRef): void {
    const editNode$ = this._editNodeSubjects[key];
    const currentSubscription = this._editNodeSubscriptions[key];

    if (currentSubscription) {
      currentSubscription.unsubscribe();
    }

    editNode$.next(null);
    this._editNodeSubscriptions[key] = treeEditNode$.pipe(takeUntil(this._destroy$)).subscribe(node => {
      editNode$.next(node);
    });
  }

  private _forEachKey(func: (key: DepTreeRef) => void): void {
    Object.keys(DepTreeRef)
      .filter(val => !isNaN(Number(val)))
      .forEach(key => func((key as unknown) as DepTreeRef));
  }
}
