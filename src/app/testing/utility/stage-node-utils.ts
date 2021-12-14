import { DependencyGraph } from 'src/app/modules/template-creator/classes/dependency-graph/dependency-graph';
import { StageEdge } from 'src/app/modules/template-creator/classes/dependency-graph/edge/stage-edge';
import { StageNode } from 'src/app/modules/template-creator/classes/dependency-graph/node/stage-node';
import { TemplateTimeline } from 'src/app/modules/template-creator/classes/timeline/template-timeline';
import { TriggerFactory } from 'src/app/modules/template-creator/classes/triggers/trigger-factory';
import { NodeType } from 'src/app/modules/template-creator/models/enums/node-type';
import { TriggerType } from 'src/app/modules/template-creator/models/enums/trigger-type';
import { DeltaArgs } from 'src/app/modules/template-creator/models/interfaces/delta-args';
import { HTTPListenerArgs } from 'src/app/modules/template-creator/models/interfaces/http-listener-args';

export const DEFAULT_DELTA_ARGS: DeltaArgs = { hours: 0, minutes: 0, seconds: 0 };
export const DEFAULT_HTTP_ARGS: HTTPListenerArgs = {
  host: 'localhost',
  port: 8000,
  routes: [{ path: '/index', method: 'GET', parameters: [{ name: 'a', value: '1' }] }]
};

export class StageNodeUtils {
  parentDepGraph: DependencyGraph;
  parentTimeline: TemplateTimeline;

  constructor(parentDepGraph: DependencyGraph, parentTimeline: TemplateTimeline) {
    this.parentDepGraph = parentDepGraph;
    this.parentTimeline = parentTimeline;
  }

  createDeltaNode = (name: string, triggerArgs = DEFAULT_DELTA_ARGS): StageNode => {
    const deltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, triggerArgs);
    const node = new StageNode({
      name,
      childDepGraph: new DependencyGraph(NodeType.CRYTON_STEP),
      timeline: this.parentTimeline,
      trigger: deltaTrigger
    });
    node.setParentDepGraph(this.parentDepGraph);
    return node;
  };

  createHttpNode = (name: string, triggerArgs = DEFAULT_HTTP_ARGS): StageNode => {
    const httpTrigger = TriggerFactory.createTrigger(TriggerType.HTTP_LISTENER, triggerArgs);
    const node = new StageNode({
      name,
      childDepGraph: new DependencyGraph(NodeType.CRYTON_STEP),
      timeline: this.parentTimeline,
      trigger: httpTrigger
    });
    node.setParentDepGraph(this.parentDepGraph);
    return node;
  };

  createGraphEdge = (parent: StageNode, child: StageNode, ignoreTimeline: boolean = true): StageEdge => {
    let edge: StageEdge;

    if (ignoreTimeline) {
      edge = new StageEdge(this.parentDepGraph, parent);
      edge.childNode = child;
      edge.parentNode.addChildEdge(edge);
      edge.childNode.addParentEdge(edge);
    } else {
      edge = this.parentDepGraph.createDraggedEdge(parent) as StageEdge;
      this.parentDepGraph.connectDraggedEdge(child);
    }

    return edge;
  };
}
