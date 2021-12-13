import { Trigger } from '../../triggers/trigger';
import { TemplateTimeline } from '../../timeline/template-timeline';
import { TimelineNode } from '../../timeline/timeline-node';
import { DependencyTree } from '../dependency-tree';
import { TreeNode } from './tree-node';
import { TriggerType } from '../../../models/enums/trigger-type';
import { DeltaDependency, DeltaDependencyFinder } from '../../utils/delta-dependency-finder';

export type TriggerArgs = Record<string, unknown>;

export interface CrytonStageConfig {
  name: string;
  childDepTree: DependencyTree;
  parentDepTree: DependencyTree;
  timeline: TemplateTimeline;
  trigger: Trigger<TriggerArgs>;
}

export class StageNode extends TreeNode {
  timeline: TemplateTimeline;
  timelineNode?: TimelineNode;
  childDepTree: DependencyTree;
  trigger: Trigger<TriggerArgs>;

  constructor(config: CrytonStageConfig) {
    super(config.parentDepTree, config.name);

    this.trigger = config.trigger;
    this.childDepTree = config.childDepTree;
    this.timeline = config.timeline;

    if (config.trigger.getType() === TriggerType.DELTA) {
      this.timelineNode = new TimelineNode(this);
    }
  }

  updateTimelineNode(): void {
    this.timelineNode?.updateX();
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
    super.changeName(name);
    this.timelineNode?.changeName(name);

    // Only draw if the node is attached to stage
    if (this.konvaObject.getStage()) {
      this.draw();
    }
  }

  /**
   * Edits stage trigger.
   *
   * @param trigger Stage trigger.
   */
  editTrigger(trigger: Trigger<TriggerArgs>): void {
    if (trigger.getType() === TriggerType.DELTA) {
      if (!this.timelineNode) {
        this._handleChangeToDelta(trigger);
      } else {
        this.trigger = trigger;
        this.timelineNode?.updateNode();
      }
    } else if (this.timelineNode) {
      this._handleChangeToNonDelta(trigger);
    }

    this.timeline.mainLayer.draw();
  }

  /**
   * Destroys cryton stage.
   */
  destroy(): void {
    super.destroy();
    this.timeline.removeNode(this.timelineNode);
    this.timelineNode?.destroy();
    this.timelineNode = null;
  }

  /**
   * Unattaches node from the dependency tree and timeline.
   * Node can still be reattached.
   */
  unattach(): void {
    super.unattach();
    this.timeline.removeNode(this.timelineNode);
    this.timelineNode?.remove();
  }

  /**
   * Handles change from delta to non-delta trigger.
   * Recreates all timeline edges as needed.
   *
   * @param trigger Non-delta trigger.
   */
  private _handleChangeToNonDelta(trigger: Trigger<TriggerArgs>): void {
    this._destroyTimelineEdges();
    this.timelineNode.destroy();
    this.timelineNode = null;

    const parents = DeltaDependencyFinder.getParents(this);
    const parentDepsBefore = DeltaDependencyFinder.getChildDependenciesOfStages(parents);

    this.trigger = trigger;

    const parentDepsAfter = DeltaDependencyFinder.getChildDependenciesOfStages(parents);
    const addedDependencies = DeltaDependencyFinder.filterAddedDependencies(parentDepsBefore, parentDepsAfter);

    addedDependencies.forEach(dependency => {
      this.timeline.createEdge(dependency.parent.timelineNode, dependency.child.timelineNode);
    });
  }

  /**
   * Handles change from non-delta trigger to delta trigger.
   * Recreates all timeline edges as needed.
   *
   * @param trigger Delta trigger.
   */
  private _handleChangeToDelta(trigger: Trigger<TriggerArgs>): void {
    this.timelineNode = new TimelineNode(this);
    this.timeline.addNode(this.timelineNode);

    const parents = DeltaDependencyFinder.getParents(this);
    const parentDepsBefore = DeltaDependencyFinder.getChildDependenciesOfStages(parents);

    this.trigger = trigger;

    const parentDepsAfter = DeltaDependencyFinder.getChildDependenciesOfStages(parents);
    const removedDependencies = DeltaDependencyFinder.filterRemovedDependencies(parentDepsBefore, parentDepsAfter);
    const addedDependencies = DeltaDependencyFinder.filterAddedDependencies(parentDepsBefore, parentDepsAfter);
    addedDependencies.push(...DeltaDependencyFinder.getChildDependencies(this));

    removedDependencies.forEach(dependency =>
      this.timeline.removeEdge(dependency.parent.timelineNode, dependency.child.timelineNode)
    );
    addedDependencies.forEach(dependency => {
      this.timeline.createEdge(dependency.parent.timelineNode, dependency.child.timelineNode);
    });
  }

  /**
   * Destroys timeline edges of this node.
   */
  private _destroyTimelineEdges(): void {
    const dependencies: DeltaDependency[] = DeltaDependencyFinder.getDependencies(this);

    dependencies.forEach(dependency => {
      this.timeline.removeEdge(dependency.parent.timelineNode, dependency.child.timelineNode);
    });
  }
}
