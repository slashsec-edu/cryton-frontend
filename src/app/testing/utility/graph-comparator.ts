import { DependencyGraph } from 'src/app/modules/template-creator/classes/dependency-graph/dependency-graph';
import { StepEdge } from 'src/app/modules/template-creator/classes/dependency-graph/edge/step-edge';
import { GraphEdge } from 'src/app/modules/template-creator/classes/dependency-graph/edge/graph-edge';
import { StageNode } from 'src/app/modules/template-creator/classes/dependency-graph/node/stage-node';
import { StepNode } from 'src/app/modules/template-creator/classes/dependency-graph/node/step-node';
import { GraphNode } from 'src/app/modules/template-creator/classes/dependency-graph/node/graph-node';
import { NodeType } from 'src/app/modules/template-creator/models/enums/node-type';
import { compareArrays } from './compare-arrays';

/**
 * Comparator used for comparing equality of dependency graphs.
 */
export class GraphComparator {
  constructor() {}

  static compareGraphs(graphOne: DependencyGraph, graphTwo: DependencyGraph): boolean {
    let nodeType: NodeType;

    if (graphOne.nodeType === NodeType.CRYTON_STAGE && graphTwo.nodeType === NodeType.CRYTON_STAGE) {
      nodeType = NodeType.CRYTON_STAGE;
    } else if (graphOne.nodeType === NodeType.CRYTON_STEP && graphTwo.nodeType === NodeType.CRYTON_STEP) {
      nodeType = NodeType.CRYTON_STEP;
    } else {
      throw new Error('Can only compare dependency graphs with the same node type.');
    }

    const compareNodesFn = (a: GraphNode, b: GraphNode): boolean =>
      nodeType === NodeType.CRYTON_STAGE
        ? this._compareStages(a as StageNode, b as StageNode)
        : this._compareSteps(a as StepNode, b as StepNode);

    return compareArrays(graphOne.graphNodeManager.nodes, graphTwo.graphNodeManager.nodes, compareNodesFn);
  }

  private static _compareStages(stageOne: StageNode, stageTwo: StageNode): boolean {
    if (stageOne.name !== stageTwo.name) {
      return false;
    }

    if (JSON.stringify(stageOne.trigger.getArgs()) !== JSON.stringify(stageTwo.trigger.getArgs())) {
      return false;
    }

    if (!GraphComparator._compareEdges(stageOne, stageTwo)) {
      return false;
    }

    if (!GraphComparator.compareGraphs(stageOne.childDepGraph, stageTwo.childDepGraph)) {
      return false;
    }

    return true;
  }

  private static _compareSteps(stepOne: StepNode, stepTwo: StepNode): boolean {
    if (
      stepOne.name.trim() !== stepTwo.name.trim() ||
      stepOne.attackModule.trim() !== stepTwo.attackModule.trim() ||
      stepOne.attackModuleArgs.trim() !== stepTwo.attackModuleArgs.trim()
    ) {
      return false;
    }

    if (!GraphComparator._compareEdges(stepOne, stepTwo)) {
      return false;
    }

    return true;
  }

  private static _compareEdges(nodeOne: GraphNode, nodeTwo: GraphNode): boolean {
    const edgeCompareFn = (a: GraphEdge, b: GraphEdge): boolean => {
      if (a.childNode instanceof StageNode && b.childNode instanceof StageNode) {
        return GraphComparator._compareStages(a.childNode, b.childNode);
      } else if (a.childNode instanceof StepNode && b.childNode instanceof StepNode) {
        return (
          GraphComparator._compareSteps(a.childNode, b.childNode) &&
          GraphComparator._compareEdgeConditions(a as StepEdge, b as StepEdge)
        );
      }
      return false;
    };

    return compareArrays(nodeOne.childEdges, nodeTwo.childEdges, edgeCompareFn);
  }

  private static _compareEdgeConditions(edgeOne: StepEdge, edgeTwo: StepEdge): boolean {
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
