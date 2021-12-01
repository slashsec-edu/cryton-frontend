import { Subject } from 'rxjs';
import { EdgeCondition } from '../../../models/interfaces/edge-condition';
import { Cursor } from '../cursor-state';
import { DependencyTree } from '../dependency-tree';
import { TreeEdge } from './tree-edge';
import { TreeNode } from '../node/tree-node';

export class StepEdge extends TreeEdge {
  static editEdge$ = new Subject<StepEdge>();
  conditions: EdgeCondition[] = [];

  constructor(depTree: DependencyTree, parentNode: TreeNode) {
    super(depTree, parentNode);
  }

  /**
   * Connects edge to the child node.
   *
   * @param childNode Child node to connect to.
   */
  connect(childNode: TreeNode): void {
    try {
      super.connect(childNode);
    } catch (error) {
      throw error;
    }

    if (this.conditions.length === 0) {
      StepEdge.editEdge$.next(this);
    }
  }

  protected _onMouseEnter(): void {
    this.depTree.cursorState.setCursor(Cursor.POINTER);
    this.color = this.depTree.theme.primary;
    super._onMouseEnter();
  }

  protected _onClick(): void {
    if (!this.depTree.toolState.isDeleteEnabled) {
      StepEdge.editEdge$.next(this);
    }
  }
}
