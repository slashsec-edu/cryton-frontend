import { TestBed } from '@angular/core/testing';
import Konva from 'konva';
import { DependencyGraph } from '../classes/dependency-graph/dependency-graph';
import { GraphNode } from '../classes/dependency-graph/node/graph-node';
import { NodeType } from '../models/enums/node-type';
import { DependencyGraphManagerService, DepGraphRef } from './dependency-graph-manager.service';

describe('DependencyGraphManagerService', () => {
  let service: DependencyGraphManagerService;

  const createTestingNode = (parentDepGraph: DependencyGraph, nodeType: NodeType): GraphNode =>
    jasmine.createSpyObj(nodeType === NodeType.CRYTON_STAGE ? 'StageNode' : 'StepNode', [], {
      name: 'test',
      parentDepGraph,
      konvaObject: new Konva.Group(),
      changeTheme: () => {},
      setParentDepGraph: () => {}
    }) as GraphNode;

  /**
   * Runs tests which rely on DepGraphRef.
   *
   * @param graphRef Dependency graph reference for manager.
   */
  const runTests = (graphRef: DepGraphRef): void => {
    const nodeType = graphRef === DepGraphRef.TEMPLATE_CREATION ? NodeType.CRYTON_STAGE : NodeType.CRYTON_STEP;

    it('should replace current graph with an empty graph of the same node type on reset', () => {
      const testingGraph = new DependencyGraph(nodeType);
      const testingStage = createTestingNode(testingGraph, NodeType.CRYTON_STAGE);

      testingGraph.graphNodeManager.addNode(testingStage);

      service.setCurrentGraph(graphRef, testingGraph);

      expect(service.getCurrentGraph(graphRef).value).toEqual(testingGraph);

      service.resetCurrentGraph(graphRef);

      const emptyGraph = service.getCurrentGraph(graphRef).value;
      expect(emptyGraph.nodeType).toEqual(nodeType);
      expect(emptyGraph.graphNodeManager.nodes).toEqual([]);
    });

    it('should backup current graph when calling editGraph', () => {
      const testingGraph = new DependencyGraph(nodeType);
      const editedGraph = new DependencyGraph(nodeType);

      service.setCurrentGraph(graphRef, testingGraph);
      service.editGraph(graphRef, editedGraph);

      expect(service.getCurrentGraph(graphRef).value).not.toEqual(testingGraph);

      service.restoreGraph(graphRef);

      expect(service.getCurrentGraph(graphRef).value).toEqual(testingGraph);
    });

    it('should destroy current graph and backup an empty graph when calling editGraph with backup=false', () => {
      const testingGraph = new DependencyGraph(nodeType);
      const editedGraph = new DependencyGraph(nodeType);

      spyOn(testingGraph, 'destroy');
      service.setCurrentGraph(graphRef, testingGraph);
      service.editGraph(graphRef, editedGraph, false);

      expect(testingGraph.destroy).toHaveBeenCalled();

      service.restoreGraph(graphRef);

      const emptyGraph = service.getCurrentGraph(graphRef).value;
      expect(emptyGraph).not.toEqual(testingGraph);
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DependencyGraphManagerService);
  });

  // These tests don't care about graph reference.
  describe('Graph type agnostic tests', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize empty dependency graphs for template and stage creation.', () => {
      const templateGraph = service.getCurrentGraph(DepGraphRef.TEMPLATE_CREATION).value;
      const stageGraph = service.getCurrentGraph(DepGraphRef.STAGE_CREATION).value;

      expect(templateGraph).toBeTruthy();
      expect(stageGraph).toBeTruthy();
    });

    it('should restore graph manager to defaul state on reset', () => {
      expect(service.getCurrentGraph(DepGraphRef.TEMPLATE_CREATION).value.graphNodeManager.nodes).toEqual([]);
      expect(service.getCurrentGraph(DepGraphRef.STAGE_CREATION).value.graphNodeManager.nodes).toEqual([]);
    });
  });

  describe('Template creation graph tests', () => {
    runTests(DepGraphRef.TEMPLATE_CREATION);
  });

  describe('Stage creation graph tests', () => {
    runTests(DepGraphRef.STAGE_CREATION);
  });
});
