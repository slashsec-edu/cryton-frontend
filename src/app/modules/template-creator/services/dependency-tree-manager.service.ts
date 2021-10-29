import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DependencyTree } from '../classes/dependency-tree/dependency-tree';
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

  constructor() {
    this._initializeTrees();
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

    this.setCurrentTree(DepTreeRef.STAGE_CREATION, depTree.copy());
  }

  /**
   * Resets dependency tree manager to default state.
   */
  reset(): void {
    this._initializeTrees();
    this._treesBackup = {};
  }

  /**
   * Initializes tree behavior subjects with empty trees.
   */
  private _initializeTrees(): void {
    this.setCurrentTree(DepTreeRef.STAGE_CREATION, new DependencyTree(NodeType.CRYTON_STEP));
    this.setCurrentTree(DepTreeRef.TEMPLATE_CREATION, new DependencyTree(NodeType.CRYTON_STAGE));
  }
}
