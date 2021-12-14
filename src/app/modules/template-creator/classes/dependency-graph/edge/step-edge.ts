import { Subject } from 'rxjs';
import { EdgeCondition } from '../../../models/interfaces/edge-condition';
import { Cursor } from '../cursor-state';
import { DependencyGraph } from '../dependency-graph';
import { GraphEdge } from './graph-edge';
import { GraphNode } from '../node/graph-node';

export class StepEdge extends GraphEdge {
  static editEdge$ = new Subject<StepEdge>();
  conditions: EdgeCondition[] = [];

  constructor(depGraph: DependencyGraph, parentNode: GraphNode) {
    super(depGraph, parentNode);
  }

  /**
   * Connects edge to the child node.
   *
   * @param childNode Child node to connect to.
   */
  connect(childNode: GraphNode): void {
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
    this.depGraph.cursorState.setCursor(Cursor.POINTER);
    this.color = this.depGraph.theme.primary;
    super._onMouseEnter();
  }

  protected _onClick(): void {
    if (!this.depGraph.toolState.isDeleteEnabled) {
      StepEdge.editEdge$.next(this);
    }
  }
}
