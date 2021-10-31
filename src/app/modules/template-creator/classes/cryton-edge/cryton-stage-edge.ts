import { TemplateTimeline } from '../timeline/template-timeline';
import { TimelineEdge } from '../timeline/timeline-edge';
import { CrytonEdge } from './cryton-edge';
import { CrytonStage } from '../cryton-node/cryton-stage';
import { DependencyTree } from '../dependency-tree/dependency-tree';
import { NodeType } from '../../models/enums/node-type';

export class CrytonStageEdge extends CrytonEdge {
  parentNode: CrytonStage;
  childNode: CrytonStage;
  timelineEdge: TimelineEdge;
  timeline: TemplateTimeline;

  nodeType = NodeType.CRYTON_STAGE;

  constructor(timeline: TemplateTimeline, depTree: DependencyTree, parentNode: CrytonStage) {
    super(depTree, parentNode);
    this.timeline = timeline;
  }

  /**
   * Connects edge to the child node.
   *
   * @param childNode Child node to connect to.
   */
  connect(childNode: CrytonStage): void {
    super.connect(childNode);
    try {
      this.isCorrectStageEdge();
    } catch (error) {
      this.destroy();
      throw error;
    }

    this.timelineEdge = new TimelineEdge(this);
    childNode.timelineNode.updateX();
    this.timeline.addEdge(this.timelineEdge);
  }

  /**
   * Destroys edge.
   */
  destroy(): void {
    super.destroy();

    this.childNode?.timelineNode.updateX();

    if (this.timelineEdge) {
      this.timelineEdge.konvaObject.destroy();
      this.timelineEdge = null;
    }
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
      throw new Error(`Child stage trigger must start later than every parent stage trigger.`);
    }
  }
}
