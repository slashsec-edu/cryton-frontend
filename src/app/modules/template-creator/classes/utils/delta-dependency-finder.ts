import { Queue } from 'src/app/modules/shared/utils/queue';
import { TriggerType } from '../../models/enums/trigger-type';
import { StageNode } from '../dependency-graph/node/stage-node';

export type DeltaDependency = { parent: StageNode; child: StageNode };

export class DeltaDependencyFinder {
  static getParentDependenciesOfStages(stages: StageNode[]): DeltaDependency[] {
    return this._getDependenciesOfStages(stages, true);
  }
  static getChildDependenciesOfStages(stages: StageNode[]): DeltaDependency[] {
    return this._getDependenciesOfStages(stages, false);
  }
  static getParentDependencies(stage: StageNode): DeltaDependency[] {
    return this._getDependenciesOfStage(stage, true);
  }
  static getChildDependencies(stage: StageNode): DeltaDependency[] {
    return this._getDependenciesOfStage(stage, false);
  }
  static getParents(stage: StageNode): StageNode[] {
    return this._closestDeltaNodesBFS(stage, true);
  }
  static getChildren(stage: StageNode): StageNode[] {
    return this._closestDeltaNodesBFS(stage, false);
  }
  static getDependencies(stage: StageNode): DeltaDependency[] {
    const dependencies: DeltaDependency[] = this._closestDeltaNodesBFS(stage, true).map(
      parent => ({ parent, child: stage } as DeltaDependency)
    );
    dependencies.push(
      ...this._closestDeltaNodesBFS(stage, false).map(child => ({ parent: stage, child } as DeltaDependency))
    );
    return dependencies;
  }

  static filterRemovedDependencies(before: DeltaDependency[], after: DeltaDependency[]): DeltaDependency[] {
    return before.filter(depBefore => !after.find(depAfter => this._dependencyComparator(depBefore, depAfter)));
  }

  static filterAddedDependencies(before: DeltaDependency[], after: DeltaDependency[]): DeltaDependency[] {
    return after.filter(depAfter => !before.find(depBefore => this._dependencyComparator(depBefore, depAfter)));
  }

  private static _closestDeltaNodesBFS(rootStage: StageNode, lookForParent: boolean): StageNode[] {
    const queue = new Queue<StageNode>();
    queue.enqueue(rootStage);

    const result: StageNode[] = [];

    while (!queue.isEmpty()) {
      const currentStage = queue.dequeue();
      const edges = lookForParent ? currentStage.parentEdges : currentStage.childEdges;

      for (const edge of edges) {
        const nextNode = (lookForParent ? edge.parentNode : edge.childNode) as StageNode;
        if (nextNode.trigger.getType() === TriggerType.DELTA) {
          if (!result.includes(nextNode)) {
            result.push(nextNode);
          }
        } else {
          queue.enqueue(nextNode);
        }
      }
    }

    return result;
  }

  private static _dependencyComparator(dependencyA: DeltaDependency, dependencyB: DeltaDependency): boolean {
    return dependencyA.child === dependencyB.child && dependencyA.parent === dependencyB.parent;
  }

  private static _getDependenciesOfStages(stages: StageNode[], lookForParents: boolean): DeltaDependency[] {
    return stages.reduce(
      (resultArray: DeltaDependency[], item: StageNode) =>
        resultArray.concat(this._getDependenciesOfStage(item, lookForParents)),
      []
    );
  }

  private static _getDependenciesOfStage(stage: StageNode, lookForParents: boolean): DeltaDependency[] {
    const nodes = this._closestDeltaNodesBFS(stage, lookForParents);
    return nodes.map(node => {
      if (lookForParents) {
        return { parent: node, child: stage } as DeltaDependency;
      } else {
        return { parent: stage, child: node } as DeltaDependency;
      }
    });
  }
}
