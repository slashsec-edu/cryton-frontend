import { DEFAULT_HTTP_ARGS, StageNodeUtils } from 'src/app/testing/utility/stage-node-utils';
import { NodeType } from '../../../models/enums/node-type';
import { TriggerType } from '../../../models/enums/trigger-type';
import { TemplateTimeline } from '../../timeline/template-timeline';
import { TriggerFactory } from '../../triggers/trigger-factory';
import { DependencyTree } from '../dependency-tree';
import { StageEdge } from '../edge/stage-edge';
import { StageNode } from './stage-node';

describe('StageNode', () => {
  const parentDepTree = new DependencyTree(NodeType.CRYTON_STAGE);
  const parentTimeline = new TemplateTimeline();
  const stageNodeUtils = new StageNodeUtils(parentDepTree, parentTimeline);

  const createDeltaNode = (name: string): StageNode => stageNodeUtils.createDeltaNode(name);
  const createHttpNode = (name: string): StageNode => stageNodeUtils.createHttpNode(name);
  const createTreeEdge = (parent: StageNode, child: StageNode, ignoreTimeline: boolean): StageEdge =>
    stageNodeUtils.createTreeEdge(parent, child, ignoreTimeline);

  beforeEach(() => {
    spyOn(parentTimeline, 'createEdge');
    spyOn(parentTimeline, 'removeEdge');
  });

  describe('Change to delta trigger', () => {
    it('should remove a transitive dependency and add 2 delta dependencies', () => {
      // Changing (D -> H -> D) to (D -> D -> D)
      const node1 = createDeltaNode('1');
      const node2 = createHttpNode('2');
      const node3 = createDeltaNode('3');
      createTreeEdge(node1, node2, false);
      createTreeEdge(node2, node3, false);

      const deltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 0 });
      node2.editTrigger(deltaTrigger);

      expect(parentTimeline.removeEdge).toHaveBeenCalledWith(node1.timelineNode, node3.timelineNode);
      expect(parentTimeline.createEdge).toHaveBeenCalledWith(node1.timelineNode, node2.timelineNode);
      expect(parentTimeline.createEdge).toHaveBeenCalledWith(node2.timelineNode, node3.timelineNode);
    });
  });

  describe('Change to http listener trigger', () => {
    it('should remove 2 delta dependencies and add a transitive dependency', () => {
      // Changin (D -> D -> D) to (D -> H -> D)
      const node1 = createDeltaNode('1');
      const node2 = createDeltaNode('2');
      const node3 = createDeltaNode('3');
      createTreeEdge(node1, node2, false);
      createTreeEdge(node2, node3, false);

      // Timeline node is gonna be dereferenced after trigger change.
      const node2TimelineNode = node2.timelineNode;

      const httpTrigger = TriggerFactory.createTrigger(TriggerType.HTTP_LISTENER, DEFAULT_HTTP_ARGS);
      node2.editTrigger(httpTrigger);

      expect(parentTimeline.removeEdge).toHaveBeenCalledTimes(2);
      expect(parentTimeline.removeEdge).toHaveBeenCalledWith(node1.timelineNode, node2TimelineNode);
      expect(parentTimeline.removeEdge).toHaveBeenCalledWith(node2TimelineNode, node3.timelineNode);
      expect(parentTimeline.createEdge).toHaveBeenCalledWith(node1.timelineNode, node3.timelineNode);
    });
  });
});
