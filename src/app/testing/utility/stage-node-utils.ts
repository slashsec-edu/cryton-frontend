import { DependencyTree } from 'src/app/modules/template-creator/classes/dependency-tree/dependency-tree';
import { StageEdge } from 'src/app/modules/template-creator/classes/dependency-tree/edge/stage-edge';
import { StageNode } from 'src/app/modules/template-creator/classes/dependency-tree/node/stage-node';
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
  parentDepTree: DependencyTree;
  parentTimeline: TemplateTimeline;

  constructor(parentDepTree: DependencyTree, parentTimeline: TemplateTimeline) {
    this.parentDepTree = parentDepTree;
    this.parentTimeline = parentTimeline;
  }

  createDeltaNode = (name: string, triggerArgs = DEFAULT_DELTA_ARGS): StageNode => {
    const deltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, triggerArgs);
    return new StageNode({
      name,
      parentDepTree: this.parentDepTree,
      childDepTree: new DependencyTree(NodeType.CRYTON_STEP),
      timeline: this.parentTimeline,
      trigger: deltaTrigger
    });
  };

  createHttpNode = (name: string, triggerArgs = DEFAULT_HTTP_ARGS): StageNode => {
    const httpTrigger = TriggerFactory.createTrigger(TriggerType.HTTP_LISTENER, triggerArgs);
    return new StageNode({
      name,
      parentDepTree: this.parentDepTree,
      childDepTree: new DependencyTree(NodeType.CRYTON_STEP),
      timeline: this.parentTimeline,
      trigger: httpTrigger
    });
  };

  createTreeEdge = (parent: StageNode, child: StageNode, ignoreTimeline: boolean = true): StageEdge => {
    let edge: StageEdge;

    if (ignoreTimeline) {
      edge = new StageEdge(this.parentDepTree, parent);
      edge.childNode = child;
      edge.parentNode.addChildEdge(edge);
      edge.childNode.addParentEdge(edge);
    } else {
      edge = this.parentDepTree.createDraggedEdge(parent) as StageEdge;
      this.parentDepTree.connectDraggedEdge(child);
    }

    return edge;
  };
}
