import { Subject } from 'rxjs';
import { NodeType } from '../../models/enums/node-type';
import { EdgeCondition } from '../../models/interfaces/edge-condition';
import { CrytonNode } from '../cryton-node/cryton-node';
import { DependencyTree } from '../dependency-tree/dependency-tree';
import { CrytonEdge } from './cryton-edge';

export class CrytonStepEdge extends CrytonEdge {
  static editEdge$ = new Subject<CrytonEdge>();
  conditions: EdgeCondition[] = [];
  nodeType = NodeType.CRYTON_STEP;

  constructor(depTree: DependencyTree, parentNode: CrytonNode) {
    super(depTree, parentNode);
  }

  /**
   * Connects edge to the child node.
   *
   * @param childNode Child node to connect to.
   */
  connect(childNode: CrytonNode): void {
    try {
      super.connect(childNode);
    } catch (error) {
      throw error;
    }

    if (this.conditions.length === 0) {
      this.emitEditEvent();
    }
  }

  /**
   * Emits edit edge event.
   * Used when clicking on a step edge for opening the edge parameters dialog window.
   */
  emitEditEvent(): void {
    CrytonStepEdge.editEdge$.next(this);
  }
}
