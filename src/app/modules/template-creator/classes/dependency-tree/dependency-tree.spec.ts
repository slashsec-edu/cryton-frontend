import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KonvaContainerComponent } from 'src/app/testing/components/konva-container.component';
import { NodeType } from '../../models/enums/node-type';
import { DependencyTree, MAX_SCALE, MIN_SCALE } from './dependency-tree';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { BehaviorSubject } from 'rxjs';
import { Theme } from '../../models/interfaces/theme';
import { TemplateTimeline } from '../timeline/template-timeline';
import { TriggerFactory } from '../triggers/trigger-factory';
import { TriggerType } from '../../models/enums/trigger-type';
import { NODE_HEIGHT, NODE_WIDTH, TreeNode, TREE_NODE_NAME, TREE_NODE_RECT_NAME } from './node/tree-node';
import { Vector2d } from 'konva/types/types';
import { EDGE_POINTER_LENGTH, TreeEdge, TREE_EDGE_NAME } from './edge/tree-edge';
import { ToolState } from './tool-state';
import { TreeComparator } from 'src/app/testing/utility/tree-comparator';
import Konva from 'konva';
import { StageNode } from './node/stage-node';
import { StepNode } from './node/step-node';
import { StepEdge } from './edge/step-edge';

describe('DependencyTree', () => {
  let depTree: DependencyTree;
  let component: KonvaContainerComponent;
  let fixture: ComponentFixture<KonvaContainerComponent>;

  const theme$ = new BehaviorSubject<Theme>(mockTheme);

  const createEdge = (parentNode: TreeNode, childNode: TreeNode): TreeEdge => {
    const edge = depTree.createDraggedEdge(parentNode);
    edge.childNode = childNode;
    edge.parentNode.addChildEdge(edge);
    edge.childNode.addParentEdge(edge);
    edge.moveToParentNode();
    edge.moveToChildNode();
    depTree.draggedEdge = null;

    return edge;
  };

  const checkEdgePoints = (edge: TreeEdge, parentNode: TreeNode, childNode: TreeNode): void => {
    const edgePoints = edge.konvaObject.points();
    const edgeStart: Vector2d = { x: edgePoints[0], y: edgePoints[1] };
    const edgeEnd: Vector2d = { x: edgePoints[2], y: edgePoints[3] };

    expect(edgeStart.x).toEqual(parentNode.x + NODE_WIDTH / 2);
    expect(edgeStart.y).toEqual(parentNode.y + NODE_HEIGHT);
    expect(edgeEnd.x).toEqual(childNode.x + NODE_WIDTH / 2);
    expect(edgeEnd.y).toEqual(childNode.y + EDGE_POINTER_LENGTH / 2);
  };

  const createStage = (name: string): StageNode => {
    const childDepTree = new DependencyTree(NodeType.CRYTON_STEP);
    const timeline = new TemplateTimeline();
    const deltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 0 });
    const stage = new StageNode({
      name,
      childDepTree,
      parentDepTree: depTree,
      timeline,
      trigger: deltaTrigger
    });
    return stage;
  };

  const createStep = (name: string): StepNode => {
    const step = new StepNode(name, '', '', depTree);
    return step;
  };

  const createNodeAtPos = (createFn: (name: string) => TreeNode, name: string, pos: Vector2d): TreeNode => {
    const node = createFn(name);
    node.parentDepTree.treeNodeManager.moveToPlan(node);
    node.x = pos.x;
    node.y = pos.y;

    return node;
  };

  const runTests = (): void => {
    it('should create', () => {
      expect(depTree).toBeTruthy();
    });

    it('should rescale correctly', () => {
      const initialScale = depTree.scale;

      depTree.rescale(0.1);
      const newScale = initialScale + 0.1;
      expect(depTree.scale).toBe(newScale);
      expect(depTree.stage.scale()).toEqual({ x: newScale, y: newScale });

      depTree.rescale(-0.1);
      expect(depTree.scale).toBe(initialScale);
      expect(depTree.stage.scale()).toEqual({ x: initialScale, y: initialScale });
    });

    it('should not rescale below 0.1 or above 1.5', () => {
      const initialScale = depTree.scale;

      // Try scaling above MAX_SCALE
      depTree.rescale(MAX_SCALE - initialScale + 0.1);
      expect(depTree.scale).toBe(initialScale, 'Stage was scaled above max. scale.');

      // Try scaling below MIN_SCALE
      depTree.rescale(MIN_SCALE - initialScale - 0.1);
      expect(depTree.scale).toBe(initialScale, 'Stage was scaled below min. scale.');
    });

    it('should return error saying that dependency tree is empty', () => {
      expect(depTree.errors()).toEqual(['Dependency tree is empty.']);
    });
  };

  const runNodeTests = (createFn: (name: string) => TreeNode): void => {
    it('should add node to the canvas', () => {
      const node = createFn('test');
      depTree.addNode(node);
      expect(depTree.treeLayer.find(`.${TREE_NODE_NAME}`).length).toEqual(1);
    });

    it('should make added node draggable if node moving is enabled', () => {
      const node = createFn('test');
      depTree.toolState = jasmine.createSpyObj('ToolState', [], { isMoveNodeEnabled: true }) as ToolState;
      depTree.addNode(node);

      expect(node.konvaObject.draggable()).toBeTrue();
    });

    it('should find root node', () => {
      const nodeOne = createNodeAtPos(createFn, '1', { x: 0, y: 0 });
      const nodeTwo = createNodeAtPos(createFn, '2', { x: 0, y: 0 });
      const nodeThree = createNodeAtPos(createFn, '3', { x: 0, y: 0 });
      const nodeFour = createNodeAtPos(createFn, '4', { x: 0, y: 0 });
      const nodeFive = createNodeAtPos(createFn, '5', { x: 0, y: 0 });
      const nodeSix = createNodeAtPos(createFn, '6', { x: 0, y: 0 });

      createEdge(nodeOne, nodeTwo);
      createEdge(nodeOne, nodeThree);
      createEdge(nodeTwo, nodeFour);
      createEdge(nodeThree, nodeFive);
      createEdge(nodeFive, nodeSix);

      const rootNode = depTree.findRootNode();
      expect(rootNode).toBe(nodeOne);
    });

    it('should throw error if there are multiple root nodes', () => {
      createNodeAtPos(createFn, '1', { x: 0, y: 0 });
      createNodeAtPos(createFn, '2', { x: 0, y: 0 });

      expect(() => depTree.findRootNode()).toThrow(new Error('Multiple root nodes in dependency tree.'));
    });

    it('should create dragged edge', () => {
      const node = createNodeAtPos(createFn, 'test', { x: 0, y: 0 });

      const edge = depTree.createDraggedEdge(node);
      expect(edge).toBeTruthy();

      const canvasEdge = depTree.treeLayer.findOne(`.${TREE_EDGE_NAME}`);
      expect(canvasEdge).toBe(edge.konvaObject);
    });

    describe('Fit screen tests', () => {
      it('1 node test', () => {
        const node = createFn('test');
        depTree.addNode(node);
        const treeNode = node;
        depTree.fitScreen();

        const nodeCenter: Vector2d = { x: treeNode.x + NODE_WIDTH / 2, y: treeNode.y + NODE_HEIGHT / 2 };

        expect(depTree.stage.width() / 2).toEqual(nodeCenter.x);
        expect(depTree.stage.height() / 2).toEqual(nodeCenter.y);
      });

      it('2 nodes with edge test', () => {
        const parentNode = createNodeAtPos(createFn, '1', { x: 0, y: 0 });
        const childNode = createNodeAtPos(createFn, '2', { x: 0, y: 200 });

        const edge = createEdge(parentNode, childNode);
        depTree.fitScreen();

        const rectHeight = 200 + NODE_HEIGHT;
        const rectCenter = { x: NODE_WIDTH / 2, y: rectHeight / 2 };
        const centeringVector = {
          x: depTree.stage.width() / 2 - rectCenter.x,
          y: depTree.stage.height() / 2 - rectCenter.y
        };

        expect(parentNode.x).toBe(centeringVector.x, 'Parent node x !== expected value');
        expect(parentNode.y).toBe(centeringVector.y, 'Parent node y !== expected value');
        expect(childNode.x).toBe(centeringVector.x, 'Child node x !== expected value');
        expect(childNode.y).toBe(centeringVector.y + 200, 'Child node y !== expected value');

        // Check if arrow was moved correctly
        checkEdgePoints(edge, parentNode, childNode);
      });

      it('2 nodes with distance greater than stage height', () => {
        const parentNode = createNodeAtPos(createFn, '1', { x: 0, y: 0 });
        const childNode = createNodeAtPos(createFn, '2', { x: 0, y: depTree.stage.height() + NODE_HEIGHT });

        expect(depTree.scale).toBe(1);
        depTree.fitScreen();
        expect(depTree.scale).toBeLessThan(1);

        const boundingRectCenter = { x: NODE_WIDTH / 2, y: (depTree.stage.height() + 2 * NODE_HEIGHT) / 2 };

        // Factor in the scale as well
        const centeringVector: Vector2d = {
          x: (depTree.stage.width() / 2) * (1 / depTree.scale) - boundingRectCenter.x,
          y: (depTree.stage.height() / 2) * (1 / depTree.scale) - boundingRectCenter.y
        };

        expect(parentNode.x).toBe(centeringVector.x, 'Parent node x !== expected value');
        expect(parentNode.y).toBe(centeringVector.y, 'Parent node y !== expected value');
        expect(childNode.x).toBe(centeringVector.x, 'Child node x !== expected value');
        expect(childNode.y).toBe(
          centeringVector.y + depTree.stage.height() + NODE_HEIGHT,
          'Child node y !== expected value'
        );
      });

      it('no nodes', () => {
        expect(depTree.scale).toBe(1);
        depTree.fitScreen();
        expect(depTree.scale).toBe(1);
      });

      it('should not rescale below MIN_SCALE', () => {
        createNodeAtPos(createFn, 'one', { x: -100000, y: 0 });
        createNodeAtPos(createFn, 'two', { x: 100000, y: 0 });

        depTree.fitScreen();

        expect(depTree.scale).toEqual(MIN_SCALE);
      });
    });

    it('should update points of all edges correctly', () => {
      const nodeOne = createNodeAtPos(createFn, 'one', { x: 50, y: 0 });
      const nodeTwo = createNodeAtPos(createFn, 'two', { x: 20, y: 100 });
      const nodeThree = createNodeAtPos(createFn, 'three', { x: 80, y: 100 });

      const edgeOne = createEdge(nodeOne, nodeTwo);
      const edgeTwo = createEdge(nodeOne, nodeThree);

      nodeOne.x = 100;
      nodeTwo.x = 70;
      nodeThree.x = 130;

      depTree.updateAllEdges();
      checkEdgePoints(edgeOne, nodeOne, nodeTwo);
      checkEdgePoints(edgeTwo, nodeOne, nodeThree);
    });

    it('should change theme correctly', () => {
      const nodeOne = createNodeAtPos(createFn, 'one', { x: 50, y: 0 });
      const nodeTwo = createNodeAtPos(createFn, 'two', { x: 20, y: 100 });
      const edgeOne = createEdge(nodeOne, nodeTwo);

      const newTheme = JSON.parse(JSON.stringify(mockTheme)) as Theme;
      newTheme.templateCreator.treeEdge = '#12345';
      newTheme.templateCreator.treeNodeRect = '#23456';

      depTree.updateTheme(newTheme);

      const nodeRects = Array.from(depTree.treeLayer.find(`.${TREE_NODE_RECT_NAME}`));

      nodeRects.forEach((rect: Konva.Rect) => {
        expect(rect.fill()).toBe('#23456');
      });
      expect(edgeOne.konvaObject.stroke()).toBe('#12345');
      expect(edgeOne.konvaObject.fill()).toBe('#12345');
    });

    it('should return no error', () => {
      createNodeAtPos(createFn, 'test', { x: 0, y: 0 });
      expect(depTree.errors()).toEqual([]);
    });
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KonvaContainerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(KonvaContainerComponent);
    component = fixture.componentInstance;
  });

  describe('Cryton stage node type', () => {
    beforeEach(() => {
      depTree = new DependencyTree(NodeType.CRYTON_STAGE);
      component.afterInit = () => depTree.initKonva(component.konvaContainer.nativeElement, theme$.asObservable());
      fixture.detectChanges();
    });

    it('should connect dragged edge', () => {
      const parentNode = createNodeAtPos(createStage, 'test', { x: 0, y: 0 });
      const childNode = createNodeAtPos(createStage, 'test', { x: 50, y: 50 });
      const edge = depTree.createDraggedEdge(parentNode);
      depTree.connectDraggedEdge(childNode);

      expect(parentNode.childEdges).toContain(edge);
      expect(childNode.parentEdges).toContain(edge);
      expect(edge.parentNode).toBe(parentNode);
      expect(edge.childNode).toBe(childNode);
      checkEdgePoints(edge, parentNode, childNode);
    });

    describe('Dependency tree validity tests', () => {
      it('no steps (should be invalid)', () => {
        expect(depTree.isValid()).toBeFalse();
      });

      it('one step (should be valid)', () => {
        createNodeAtPos(createStep, 'test', { x: 0, y: 0 });
        expect(depTree.isValid()).toBeTrue();
      });

      it('multiple root nodes (should be valid)', () => {
        createNodeAtPos(createStep, 'one', { x: 0, y: 0 });
        createNodeAtPos(createStep, 'two', { x: 0, y: 0 });
        expect(depTree.isValid()).toBeTrue();
      });

      it('multiple steps && signle root node (should be valid)', () => {
        const stepOne = createNodeAtPos(createStep, 'one', { x: 0, y: 0 });
        const stepTwo = createNodeAtPos(createStep, 'two', { x: 0, y: 0 });
        const stepThree = createNodeAtPos(createStep, 'three', { x: 0, y: 0 });
        createEdge(stepOne, stepTwo);
        createEdge(stepOne, stepThree);

        expect(depTree.isValid()).toBeTrue();
      });
    });

    runTests();
    runNodeTests(createStage);
  });

  describe('Cryton step node type', () => {
    beforeEach(() => {
      depTree = new DependencyTree(NodeType.CRYTON_STEP);
      component.afterInit = () => depTree.initKonva(component.konvaContainer.nativeElement, theme$.asObservable());
      fixture.detectChanges();
    });

    describe('Copy tests', () => {
      it('rescaled and moved empty tree', () => {
        depTree.rescale(0.1);
        depTree.stage.x(150);
        depTree.stage.y(-30);

        const treeCopy = depTree.copy();
        expect(TreeComparator.compareTrees(depTree, treeCopy)).toBeTrue();
      });

      it('tree with one step', () => {
        createNodeAtPos(createStep, 'test', { x: 50, y: 50 });

        const treeCopy = depTree.copy();
        expect(TreeComparator.compareTrees(depTree, treeCopy)).toBeTrue();
      });

      it('tree with two steps and edge', () => {
        const parentStep = createNodeAtPos(createStep, 'parent', { x: 0, y: 0 });
        const childStep = createNodeAtPos(createStep, 'child', { x: 50, y: 50 });
        createEdge(parentStep, childStep);

        const treeCopy = depTree.copy();
        expect(TreeComparator.compareTrees(depTree, treeCopy)).toBeTrue();
      });

      it('complex tree', () => {
        const stepOne = createNodeAtPos(createStep, 'stepOne', { x: 0, y: 0 });
        const stepTwo = createNodeAtPos(createStep, 'stepTwo', { x: 0, y: 0 });
        const stepThree = createNodeAtPos(createStep, 'stepThree', { x: 0, y: 0 });
        const stepFour = createNodeAtPos(createStep, 'stepFour', { x: 0, y: 0 });
        const stepFive = createNodeAtPos(createStep, 'stepFive', { x: 0, y: 0 });
        const stepSix = createNodeAtPos(createStep, 'stepSix', { x: 0, y: 0 });
        const stepSeven = createNodeAtPos(createStep, 'stepSeven', { x: 0, y: 0 });
        const stepEight = createNodeAtPos(createStep, 'stepEight', { x: 0, y: 0 });
        const stepNine = createNodeAtPos(createStep, 'stepNine', { x: 0, y: 0 });
        const stepTen = createNodeAtPos(createStep, 'stepTen', { x: 0, y: 0 });

        const edgeOne = createEdge(stepOne, stepTwo) as StepEdge;
        edgeOne.conditions.push({ type: 'result', value: 'OK' });
        const edgeTwo = createEdge(stepOne, stepThree) as StepEdge;
        edgeTwo.conditions.push({ type: 'state', value: 'RUNNING' });
        const edgeThree = createEdge(stepOne, stepFour) as StepEdge;
        edgeThree.conditions.push({ type: 'std_out', value: '15' });
        const edgeFour = createEdge(stepTwo, stepFive) as StepEdge;
        edgeFour.conditions.push({ type: 'mod_err', value: 'An error occured.' });
        const edgeFive = createEdge(stepThree, stepSix) as StepEdge;
        edgeFive.conditions.push({ type: 'return_code', value: '1' });
        const edgeSix = createEdge(stepThree, stepSeven) as StepEdge;
        edgeSix.conditions.push({ type: 'std_err', value: 'An error occured.' });
        const edgeSeven = createEdge(stepFour, stepEight) as StepEdge;
        edgeSeven.conditions.push({ type: 'mod_out', value: '50' });
        const edgeEight = createEdge(stepFour, stepNine) as StepEdge;
        edgeEight.conditions.push({ type: 'any', value: 'test' });
        const edgeNine = createEdge(stepNine, stepTen) as StepEdge;
        edgeNine.conditions.push({ type: 'result', value: 'OK' }, { type: 'state', value: 'DOWN' });

        const treeCopy = depTree.copy();
        expect(TreeComparator.compareTrees(depTree, treeCopy)).toBeTrue();
      });
    });

    describe('Dependency tree validity tests', () => {
      it('no steps (should be invalid)', () => {
        expect(depTree.isValid()).toBeFalse();
      });

      it('one step (should be valid)', () => {
        createNodeAtPos(createStep, 'test', { x: 0, y: 0 });
        expect(depTree.isValid()).toBeTrue();
      });

      it('multiple root nodes (should be valid)', () => {
        createNodeAtPos(createStep, 'one', { x: 0, y: 0 });
        createNodeAtPos(createStep, 'two', { x: 0, y: 0 });
        expect(depTree.isValid()).toBeTrue();
      });

      it('multiple steps && signle root node (should be valid)', () => {
        const stepOne = createNodeAtPos(createStep, 'one', { x: 0, y: 0 });
        const stepTwo = createNodeAtPos(createStep, 'two', { x: 0, y: 0 });
        const stepThree = createNodeAtPos(createStep, 'three', { x: 0, y: 0 });
        createEdge(stepOne, stepTwo);
        createEdge(stepOne, stepThree);

        expect(depTree.isValid()).toBeTrue();
      });
    });

    runTests();
    runNodeTests(createStep);
  });
});
