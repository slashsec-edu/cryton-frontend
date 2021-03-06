import { StageNodeUtils } from 'src/app/testing/utility/stage-node-utils';
import { NodeType } from '../../../models/enums/node-type';
import { TemplateTimeline } from '../../timeline/template-timeline';
import { DependencyGraph } from '../dependency-graph';
import { StageNode } from '../node/stage-node';
import { StageEdge } from './stage-edge';

describe('StageEdge', () => {
  const parentDepGraph = new DependencyGraph(NodeType.CRYTON_STAGE);
  const parentTimeline = new TemplateTimeline();
  const stageNodeUtils = new StageNodeUtils(parentDepGraph, parentTimeline);

  const createDeltaNode = (name: string): StageNode => stageNodeUtils.createDeltaNode(name);
  const createHttpNode = (name: string): StageNode => stageNodeUtils.createHttpNode(name);
  const createGraphEdge = (parent: StageNode, child: StageNode, ignoreTimeline: boolean): StageEdge =>
    stageNodeUtils.createGraphEdge(parent, child, ignoreTimeline);

  beforeEach(() => {
    spyOn(parentTimeline, 'createEdge');
    spyOn(parentTimeline, 'removeEdge');
  });

  describe('1 delta dependency graph', () => {
    // D -> D
    let node1: StageNode, node2: StageNode;

    beforeEach(() => {
      node1 = createDeltaNode('1');
      node2 = createDeltaNode('2');
    });

    it('should create a timeline edge', () => {
      createGraphEdge(node1, node2, false);
      expect(parentTimeline.createEdge).toHaveBeenCalledTimes(1);
      expect(parentTimeline.createEdge).toHaveBeenCalledWith(node1.timelineNode, node2.timelineNode);
    });

    it('should remove a timeline edge', () => {
      const edge = createGraphEdge(node1, node2, false);
      edge.destroy();
      expect(parentTimeline.removeEdge).toHaveBeenCalledTimes(1);
      expect(parentTimeline.removeEdge).toHaveBeenCalledWith(node1.timelineNode, node2.timelineNode);
    });
  });

  describe('3 delta dependencies graph', () => {
    //        D
    //       /
    // D -> H -> D
    //       \
    //        D
    let node1: StageNode, node2: StageNode, node3: StageNode, node4: StageNode, node5: StageNode;

    beforeEach(() => {
      node1 = createDeltaNode('1');
      node2 = createHttpNode('2');
      node3 = createDeltaNode('3');
      node4 = createDeltaNode('4');
      node5 = createDeltaNode('5');
      createGraphEdge(node2, node3, false);
      createGraphEdge(node2, node4, false);
      createGraphEdge(node2, node5, false);
    });

    it('should create 3 timeline edges', () => {
      createGraphEdge(node1, node2, false);
      expect(parentTimeline.createEdge).toHaveBeenCalledTimes(3);
      expect(parentTimeline.createEdge).toHaveBeenCalledWith(node1.timelineNode, node3.timelineNode);
      expect(parentTimeline.createEdge).toHaveBeenCalledWith(node1.timelineNode, node4.timelineNode);
      expect(parentTimeline.createEdge).toHaveBeenCalledWith(node1.timelineNode, node5.timelineNode);
    });

    it('should remove 3 timeline edges', () => {
      const edge = createGraphEdge(node1, node2, false);
      edge.destroy();

      expect(parentTimeline.removeEdge).toHaveBeenCalledTimes(3);
      expect(parentTimeline.removeEdge).toHaveBeenCalledWith(node1.timelineNode, node3.timelineNode);
      expect(parentTimeline.removeEdge).toHaveBeenCalledWith(node1.timelineNode, node4.timelineNode);
      expect(parentTimeline.removeEdge).toHaveBeenCalledWith(node1.timelineNode, node5.timelineNode);
    });
  });
});
