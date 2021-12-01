import { NodeType } from '../../models/enums/node-type';
import { DependencyTree } from '../dependency-tree/dependency-tree';
import { StageNode } from '../dependency-tree/node/stage-node';
import { TemplateTimeline } from '../timeline/template-timeline';
import { DeltaDependencyFinder } from './delta-dependency-finder';
import { StageNodeUtils } from 'src/app/testing/utility/stage-node-utils';

describe('DeltaDependencyFinder', () => {
  const parentDepTree = new DependencyTree(NodeType.CRYTON_STAGE);
  const parentTimeline = new TemplateTimeline();
  const stageNodeUtils = new StageNodeUtils(parentDepTree, parentTimeline);

  const createDeltaNode = (name: string): StageNode => stageNodeUtils.createDeltaNode(name);
  const createHttpNode = (name: string): StageNode => stageNodeUtils.createHttpNode(name);
  const createTreeEdge = (parent: StageNode, child: StageNode) => stageNodeUtils.createTreeEdge(parent, child);

  describe('filtering tests', () => {
    const node1 = createDeltaNode('1');
    const node2 = createDeltaNode('2');
    const node3 = createDeltaNode('3');
    const node4 = createDeltaNode('4');
    const node5 = createDeltaNode('5');

    const before = [
      { parent: node1, child: node2 },
      { parent: node1, child: node3 },
      { parent: node2, child: node3 }
    ];
    const after = [
      { parent: node1, child: node2 },
      { parent: node1, child: node4 },
      { parent: node1, child: node5 },
      { parent: node2, child: node1 }
    ];

    it('should filter all added dependencies', () => {
      const newDependencies = DeltaDependencyFinder.filterAddedDependencies(before, after);
      expect(newDependencies).toEqual([
        { parent: node1, child: node4 },
        { parent: node1, child: node5 },
        { parent: node2, child: node1 }
      ]);
    });

    it('should filter all removed dependencies', () => {
      const newDependencies = DeltaDependencyFinder.filterRemovedDependencies(before, after);
      expect(newDependencies).toEqual([
        { parent: node1, child: node3 },
        { parent: node2, child: node3 }
      ]);
    });
  });

  describe('basic tree', () => {
    // D -> H -> D
    const node1 = createDeltaNode('1');
    const node2 = createHttpNode('2');
    const node3 = createDeltaNode('3');

    createTreeEdge(node1, node2);
    createTreeEdge(node2, node3);

    it('should find transitive child dependency', () => {
      const dependencies = DeltaDependencyFinder.getChildDependencies(node1);
      expect(dependencies.length).toBe(1);
      expect(dependencies[0]).toEqual({ parent: node1, child: node3 });
    });

    it('should find transitive parent dependency', () => {
      const dependencies = DeltaDependencyFinder.getParentDependencies(node3);
      expect(dependencies.length).toBe(1);
      expect(dependencies[0]).toEqual({ parent: node1, child: node3 });
    });

    it('should find node3 as a child of node1', () => {
      const children = DeltaDependencyFinder.getChildren(node1);
      expect(children.length).toBe(1);
      expect(children[0]).toBe(node3);
    });

    it('should find node1 as a parent of node3', () => {
      const children = DeltaDependencyFinder.getParents(node3);
      expect(children.length).toBe(1);
      expect(children[0]).toBe(node1);
    });
  });

  describe('advanced tree', () => {
    //                  H ----.
    //                 /       \
    // D -> H -> H -> D -> H -> H -> D
    //                 \       /
    //                  H ----'
    const node1 = createDeltaNode('1');
    const node2 = createHttpNode('2');
    const node3 = createHttpNode('3');
    const node4 = createDeltaNode('4');
    const node5 = createHttpNode('5');
    const node6 = createHttpNode('6');
    const node7 = createHttpNode('7');
    const node8 = createHttpNode('8');
    const node9 = createDeltaNode('9');

    createTreeEdge(node1, node2);
    createTreeEdge(node2, node3);
    createTreeEdge(node3, node4);
    createTreeEdge(node4, node5);
    createTreeEdge(node4, node6);
    createTreeEdge(node4, node7);
    createTreeEdge(node5, node8);
    createTreeEdge(node6, node8);
    createTreeEdge(node7, node8);
    createTreeEdge(node8, node9);

    it('should find all child delta dependencies', () => {
      const dependencies = DeltaDependencyFinder.getChildDependenciesOfStages([node1, node4, node9]);
      expect(dependencies).toEqual([
        { parent: node1, child: node4 },
        { parent: node4, child: node9 }
      ]);
    });

    it('should find all parent delta dependencies', () => {
      const dependencies = DeltaDependencyFinder.getParentDependenciesOfStages([node1, node4, node9]);
      expect(dependencies).toEqual([
        { parent: node1, child: node4 },
        { parent: node4, child: node9 }
      ]);
    });
  });
});
