import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
export class DependencyTreeManagerService {
  private _currentTrees: Record<string, BehaviorSubject<DependencyTree>> = {};
  private _treesBackup: Record<string, DependencyTree> = {};
  private _dispensers: Record<string, BehaviorSubject<TreeNode[]>> = {};

  constructor() {
    this._initialize();
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

    if (currentTree$) {
      currentTree$.next(new DependencyTree(currentTree$.value.nodeType));
    }
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
    this._initialize();
    this._treesBackup = {};
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

  /**
   * Initializes tree behavior subjects with empty trees.
   */
  private _initialize(): void {
    this.setCurrentTree(DepTreeRef.STAGE_CREATION, new DependencyTree(NodeType.CRYTON_STEP));
    this.setCurrentTree(DepTreeRef.TEMPLATE_CREATION, new DependencyTree(NodeType.CRYTON_STAGE));

    Object.keys(DepTreeRef).forEach(key => {
      const dispenser = this._dispensers[key];

      if (!dispenser) {
        this._dispensers[key] = new BehaviorSubject<TreeNode[]>([]);
      }
    });
  }
}
