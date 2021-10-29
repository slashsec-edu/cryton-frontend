import { DependencyTree } from '../dependency-tree/dependency-tree';
import { CrytonNode } from './cryton-node';
import { TemplateTimeline } from '../timeline/template-timeline';
import { TimelineNode } from '../timeline/timeline-node';
import { TreeNode } from '../dependency-tree/tree-node';
import { NodeType } from '../../models/enums/node-type';
import { CrytonStageEdge } from '../cryton-edge/cryton-stage-edge';
import { Trigger } from './triggers/trigger';

export interface CrytonStageConfig {
  name: string;
  childDepTree: DependencyTree;
  parentDepTree: DependencyTree;
  timeline: TemplateTimeline;
  trigger: Trigger<TriggerArgs>;
}

type TriggerArgs = Record<string, unknown>;

export class CrytonStage extends CrytonNode {
  childDepTree: DependencyTree;

  timeline: TemplateTimeline;
  timelineNode: TimelineNode;

  childEdges: CrytonStageEdge[] = [];
  parentEdges: CrytonStageEdge[] = [];

  trigger: Trigger<TriggerArgs>;

  constructor(config: CrytonStageConfig) {
    super(config.name, config.parentDepTree);

    this.trigger = config.trigger;
    this.childDepTree = config.childDepTree;
    this.timeline = config.timeline;

    this.treeNode = new TreeNode(this, NodeType.CRYTON_STAGE);
    this.timelineNode = new TimelineNode(this);
  }

  updateTimelineNode(): void {
    this.timelineNode.updateX();
  }

  /**
   * Edits child dependency tree.
   *
   * @param childDepTree New child dependency tree.
   */
  editChildDepTree(childDepTree: DependencyTree): void {
    this.childDepTree = childDepTree;
  }

  /**
   * Edits stage name.
   *
   * @param name New stage name.
   */
  editName(name: string): void {
    this.timelineNode.changeName(name);
    super.editName(name);
  }

  /**
   * Edits stage trigger.
   *
   * @param trigger Stage trigger.
   */
  editTrigger(trigger: Trigger<TriggerArgs>): void {
    try {
      this.timelineNode.checkTriggerStart(trigger.getStartTime());
      this.trigger = trigger;
      this.timelineNode.updateNode();
    } catch (e) {
      throw e;
    }
  }

  /**
   * Destroys cryton stage.
   */
  destroy(): void {
    super.destroy();
    this.timeline.removeNode(this.timelineNode);
    this.timelineNode.konvaObject.destroy();
    this.timelineNode = null;
  }

  /**
   * Unattaches node from the dependency tree and timeline.
   * Node can still be reattached.
   */
  unattach(): void {
    super.unattach();
    this.timeline.removeNode(this.timelineNode);
    this.timelineNode.konvaObject.remove();
  }
}
