import { TestBed } from '@angular/core/testing';
import Konva from 'konva';
import { DependencyTree } from '../classes/dependency-tree/dependency-tree';
import { TreeNode } from '../classes/dependency-tree/node/tree-node';
import { NodeType } from '../models/enums/node-type';

import { DependencyTreeManagerService, DepTreeRef } from './dependency-tree-manager.service';

describe('DependencyTreeManagerService', () => {
  let service: DependencyTreeManagerService;

  const createTestingNode = (parentDepTree: DependencyTree, nodeType: NodeType): TreeNode =>
    jasmine.createSpyObj(nodeType === NodeType.CRYTON_STAGE ? 'StageNode' : 'StepNode', [], {
      name: 'test',
      parentDepTree,
      konvaObject: new Konva.Group(),
      changeTheme: () => {}
    }) as TreeNode;

  /**
   * Runs tests which rely on DepTreeRef.
   *
   * @param treeRef Dependency tree reference for manager.
   */
  const runTests = (treeRef: DepTreeRef): void => {
    const nodeType = treeRef === DepTreeRef.TEMPLATE_CREATION ? NodeType.CRYTON_STAGE : NodeType.CRYTON_STEP;

    it('should replace current tree with an empty tree of the same node type on reset', () => {
      const testingTree = new DependencyTree(nodeType);
      const testingStage = createTestingNode(testingTree, NodeType.CRYTON_STAGE);

      testingTree.treeNodeManager.addNode(testingStage);

      service.setCurrentTree(treeRef, testingTree);

      expect(service.getCurrentTree(treeRef).value).toEqual(testingTree);

      service.resetCurrentTree(treeRef);

      const emptyTree = service.getCurrentTree(treeRef).value;
      expect(emptyTree.nodeType).toEqual(nodeType);
      expect(emptyTree.treeNodeManager.nodes).toEqual([]);
    });

    it('should backup current tree when calling editTree', () => {
      const testingTree = new DependencyTree(nodeType);
      const editedTree = new DependencyTree(nodeType);

      service.setCurrentTree(treeRef, testingTree);
      service.editTree(treeRef, editedTree);

      expect(service.getCurrentTree(treeRef).value).not.toEqual(testingTree);

      service.restoreTree(treeRef);

      expect(service.getCurrentTree(treeRef).value).toEqual(testingTree);
    });

    it('should destroy current tree and backup an empty tree when calling editTree with backup=false', () => {
      const testingTree = new DependencyTree(nodeType);
      const editedTree = new DependencyTree(nodeType);

      spyOn(testingTree, 'destroy');
      service.setCurrentTree(treeRef, testingTree);
      service.editTree(treeRef, editedTree, false);

      expect(testingTree.destroy).toHaveBeenCalled();

      service.restoreTree(treeRef);

      const emptyTree = service.getCurrentTree(treeRef).value;
      expect(emptyTree).not.toEqual(testingTree);
    });
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DependencyTreeManagerService);
  });

  // These tests don't care about tree reference.
  describe('Tree type agnostic tests', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize empty dependency trees for template and stage creation.', () => {
      const templateTree = service.getCurrentTree(DepTreeRef.TEMPLATE_CREATION).value;
      const stageTree = service.getCurrentTree(DepTreeRef.STAGE_CREATION).value;

      expect(templateTree).toBeTruthy();
      expect(stageTree).toBeTruthy();
    });

    it('should restore tree manager to defaul state on reset', () => {
      expect(service.getCurrentTree(DepTreeRef.TEMPLATE_CREATION).value.treeNodeManager.nodes).toEqual([]);
      expect(service.getCurrentTree(DepTreeRef.STAGE_CREATION).value.treeNodeManager.nodes).toEqual([]);
    });
  });

  describe('Template creation tree tests', () => {
    runTests(DepTreeRef.TEMPLATE_CREATION);
  });

  describe('Stage creation tree tests', () => {
    runTests(DepTreeRef.STAGE_CREATION);
  });
});
