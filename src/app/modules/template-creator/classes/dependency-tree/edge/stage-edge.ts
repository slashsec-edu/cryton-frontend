import { TriggerType } from '../../../models/enums/trigger-type';
import { DeltaDependency, DeltaDependencyFinder } from '../../utils/delta-dependency-finder';
import { DependencyTree } from '../dependency-tree';
import { StageNode } from '../node/stage-node';
import { TreeEdge } from './tree-edge';

export class StageEdge extends TreeEdge {
  parentNode: StageNode;
  childNode: StageNode;

  constructor(depTree: DependencyTree, parentNode: StageNode) {
    super(depTree, parentNode);
  }

  /**
   * Destroys the edge and all timeline edges that get disconnected by this destruction.
   */
  destroy(): void {
    const timeline = this.parentNode.timeline;
    let childDeltas: StageNode[];

    if (this.childNode.trigger.getType() === TriggerType.DELTA) {
      childDeltas = [this.childNode];
    } else {
      childDeltas = DeltaDependencyFinder.getChildren(this.parentNode);
    }
    let dependenciesBefore: DeltaDependency[];

    if (childDeltas.length > 0) {
      dependenciesBefore = DeltaDependencyFinder.getParentDependenciesOfStages(childDeltas);
    } else {
      return super.destroy();
    }

    super.destroy();

    const dependenciesAfter = DeltaDependencyFinder.getParentDependenciesOfStages(childDeltas);
    const removedDependencies = DeltaDependencyFinder.filterRemovedDependencies(dependenciesBefore, dependenciesAfter);

    removedDependencies.forEach((dependency: DeltaDependency) => {
      timeline.removeEdge(dependency.parent.timelineNode, dependency.child.timelineNode);
    });
  }

  /**
   * Connects edge to the child node.
   * If child node has trigger type of delta, looks for all parent deltas
   * to create transitive timeline edges between delta stages.
   *
   * @param childNode Child node to connect to.
   */
  connect(childNode: StageNode): void {
    const timeline = childNode.timeline;
    let childDeltas: StageNode[];

    if (childNode.trigger.getType() === TriggerType.DELTA) {
      childDeltas = [childNode];
    } else {
      childDeltas = DeltaDependencyFinder.getChildren(childNode);
    }
    const dependenciesBefore = DeltaDependencyFinder.getParentDependenciesOfStages(childDeltas);

    try {
      super.connect(childNode);
      this.isCorrectStageEdge();
    } catch (error) {
      throw error;
    }

    const dependenciesAfter = DeltaDependencyFinder.getParentDependenciesOfStages(childDeltas);
    const addedDependencies = DeltaDependencyFinder.filterAddedDependencies(dependenciesBefore, dependenciesAfter);

    addedDependencies.forEach((dependency: DeltaDependency) => {
      timeline.createEdge(dependency.parent.timelineNode, dependency.child.timelineNode);
    });
  }

  /**
   * Checks if edge from parent node to child node is a correct edge.
   * There must be no cycles.
   * There can't already be the same edge.
   */
  isCorrectStageEdge(): void {
    const childStart = this.childNode.trigger.getStartTime();
    const parentStart = this.parentNode.trigger.getStartTime();

    if (childStart && parentStart && parentStart >= childStart) {
      this.destroy();
      throw new Error(`Child stage trigger must start later or at the same time as every parent stage trigger.`);
    }
  }
}
