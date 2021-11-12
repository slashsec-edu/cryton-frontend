import { CrytonEdge } from 'src/app/modules/template-creator/classes/cryton-edge/cryton-edge';
import { CrytonStepEdge } from 'src/app/modules/template-creator/classes/cryton-edge/cryton-step-edge';
import { CrytonNode } from 'src/app/modules/template-creator/classes/cryton-node/cryton-node';
import { CrytonStage } from 'src/app/modules/template-creator/classes/cryton-node/cryton-stage';
import { CrytonStep } from 'src/app/modules/template-creator/classes/cryton-node/cryton-step';
import { DependencyTree } from 'src/app/modules/template-creator/classes/dependency-tree/dependency-tree';
import { NodeType } from 'src/app/modules/template-creator/models/enums/node-type';
import { compareArrays } from './compare-arrays';

/**
 * Comparator used for comparing equality of dependency trees.
 */
export class TreeComparator {
  constructor() {}

  static compareTrees(treeOne: DependencyTree, treeTwo: DependencyTree): boolean {
    let nodeType: NodeType;

    if (treeOne.nodeType === NodeType.CRYTON_STAGE && treeTwo.nodeType === NodeType.CRYTON_STAGE) {
      nodeType = NodeType.CRYTON_STAGE;
    } else if (treeOne.nodeType === NodeType.CRYTON_STEP && treeTwo.nodeType === NodeType.CRYTON_STEP) {
      nodeType = NodeType.CRYTON_STEP;
    } else {
      throw new Error('Can only compare dependency trees with the same node type.');
    }

    const compareNodesFn = (a: CrytonNode, b: CrytonNode): boolean =>
      nodeType === NodeType.CRYTON_STAGE
        ? this._compareStages(a as CrytonStage, b as CrytonStage)
        : this._compareSteps(a as CrytonStep, b as CrytonStep);

    return compareArrays(treeOne.treeNodeManager.canvasNodes, treeTwo.treeNodeManager.canvasNodes, compareNodesFn);
  }

  private static _compareStages(stageOne: CrytonStage, stageTwo: CrytonStage): boolean {
    if (stageOne.name !== stageTwo.name) {
      return false;
    }

    if (JSON.stringify(stageOne.trigger.getArgs()) !== JSON.stringify(stageTwo.trigger.getArgs())) {
      return false;
    }

    if (!TreeComparator._compareEdges(stageOne, stageTwo)) {
      return false;
    }

    if (!TreeComparator.compareTrees(stageOne.childDepTree, stageTwo.childDepTree)) {
      return false;
    }

    return true;
  }

  private static _compareSteps(stepOne: CrytonStep, stepTwo: CrytonStep): boolean {
    if (
      stepOne.name.trim() !== stepTwo.name.trim() ||
      stepOne.attackModule.trim() !== stepTwo.attackModule.trim() ||
      stepOne.attackModuleArgs.trim() !== stepTwo.attackModuleArgs.trim()
    ) {
      return false;
    }

    if (!TreeComparator._compareEdges(stepOne, stepTwo)) {
      return false;
    }

    return true;
  }

  private static _compareEdges(nodeOne: CrytonNode, nodeTwo: CrytonNode): boolean {
    const edgeCompareFn = (a: CrytonEdge, b: CrytonEdge): boolean => {
      if (a.childNode instanceof CrytonStage && b.childNode instanceof CrytonStage) {
        return TreeComparator._compareStages(a.childNode, b.childNode);
      } else if (a.childNode instanceof CrytonStep && b.childNode instanceof CrytonStep) {
        return (
          TreeComparator._compareSteps(a.childNode, b.childNode) &&
          TreeComparator._compareEdgeConditions(a as CrytonStepEdge, b as CrytonStepEdge)
        );
      }
      return false;
    };

    return compareArrays(nodeOne.childEdges, nodeTwo.childEdges, edgeCompareFn);
  }

  private static _compareEdgeConditions(edgeOne: CrytonStepEdge, edgeTwo: CrytonStepEdge): boolean {
    const conditionsOne = edgeOne.conditions.map(condition => JSON.stringify(condition)).sort();
    const conditionsTwo = edgeTwo.conditions.map(condition => JSON.stringify(condition)).sort();

    if (conditionsOne.length !== conditionsTwo.length) {
      return false;
    }

    for (let i = 0; i < conditionsOne.length; i++) {
      if (conditionsOne[i] !== conditionsTwo[i]) {
        return false;
      }
    }

    return true;
  }

  private static _arrRemoveItem<T>(array: T[], item: T): void {
    const itemIndex = array.indexOf(item);

    if (itemIndex === -1) {
      return;
    }

    array.splice(itemIndex, 1);
  }
}
