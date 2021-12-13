import Konva from 'konva';
import { NodeType } from '../../../models/enums/node-type';
import { DependencyTree } from '../dependency-tree';
import { CONNECTOR_CIRCLE_NAME, CONNECTOR_NAME } from '../node-connector';
import { NODE_HEIGHT, NODE_WIDTH, TreeNode, TREE_NODE_RECT_NAME, TREE_NODE_TEXT_NAME } from './tree-node';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { Theme } from '../../../models/interfaces/theme';
import { SETTINGS_BTN_NAME } from '../settings-button';
import { TemplateTimeline } from '../../timeline/template-timeline';
import { TriggerFactory } from '../../triggers/trigger-factory';
import { TriggerType } from '../../../models/enums/trigger-type';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KonvaContainerComponent } from 'src/app/testing/components/konva-container.component';
import { of } from 'rxjs';
import { StepEdge } from '../edge/step-edge';
import { StepNode } from './step-node';
import { StageNode } from './stage-node';

const DEFAULT_NAME = 'test';

describe('TreeNode', () => {
  let fixture: ComponentFixture<KonvaContainerComponent>;
  let component: KonvaContainerComponent;

  // Testing primarily with StepNode for methods which don't depend on node type.
  let dependencyTree: DependencyTree;
  let treeNode: TreeNode;

  // Use stepEdgeStub to mock parent / child edges.
  const stepEdgeStub = jasmine.createSpyObj('StepEdge', ['moveToParentNode', 'moveToChildNode']) as StepEdge;

  const createStep = (name: string) => {
    treeNode = new StepNode(name, '', '', dependencyTree);
  };

  const createStage = (name: string) => {
    treeNode = new StageNode({
      name,
      parentDepTree: dependencyTree,
      childDepTree: new DependencyTree(NodeType.CRYTON_STEP),
      timeline: new TemplateTimeline(),
      trigger: TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 0 })
    });
  };

  const getNameText = (): Konva.Text => treeNode.konvaObject.findOne(`.${TREE_NODE_TEXT_NAME}`);
  const getNodeRect = (): Konva.Rect => treeNode.konvaObject.findOne(`.${TREE_NODE_RECT_NAME}`);
  const getConnector = (): Konva.Group => treeNode.konvaObject.findOne(`.${CONNECTOR_NAME}`);
  const getConnectorCircle = (): Konva.Circle => getConnector().findOne(`.${CONNECTOR_CIRCLE_NAME}`);
  const getSettingsButton = (): Konva.Group => treeNode.konvaObject.findOne(`.${SETTINGS_BTN_NAME}`);

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KonvaContainerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    dependencyTree = new DependencyTree(NodeType.CRYTON_STEP);
    createStep(DEFAULT_NAME);
  });

  describe('Initialization tests', () => {
    it('should create', () => {
      expect(treeNode).toBeTruthy();
    });

    it('should create node rect correctly', () => {
      const nodeRect = getNodeRect();
      expect(nodeRect).toBeTruthy();
      expect(nodeRect.width()).toBe(NODE_WIDTH);
      expect(nodeRect.height()).toBe(NODE_HEIGHT);
    });

    it('should create connector correctly', () => {
      const connector = getConnector();
      expect(connector).toBeTruthy();
    });

    it('should render name corectly', () => {
      const nameText = getNameText();

      expect(nameText).toBeTruthy();
      expect(nameText.text()).toBe(DEFAULT_NAME);
    });

    it('should create settings button correctly', () => {
      const settingsBtn = getSettingsButton();
      expect(settingsBtn).toBeTruthy();
    });
  });

  describe('Mouse events tests', () => {
    let konvaContainer: HTMLDivElement;

    const testStrokeAnimation = (): void => {
      spyOn(treeNode.strokeAnimation, 'activate');

      treeNode.konvaObject.fire('mouseenter');

      expect(konvaContainer.style.cursor).toBe('pointer');
      expect(treeNode.strokeAnimation.activate).toHaveBeenCalled();
    };

    const testCursorReset = (expectedTempCursor: string): void => {
      treeNode.konvaObject.fire('mouseenter');
      expect(konvaContainer.style.cursor).toBe(expectedTempCursor);
      treeNode.konvaObject.fire('mouseleave');
      expect(konvaContainer.style.cursor).toBe('default');
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(KonvaContainerComponent);
      component = fixture.componentInstance;

      component.afterInit = () => dependencyTree.initKonva(component.konvaContainer.nativeElement, of(mockTheme));
      fixture.detectChanges();

      konvaContainer = component.konvaContainer.nativeElement as HTMLDivElement;
      dependencyTree.addNode(treeNode);
    });

    it('swap enabled mouse enter', () => {
      dependencyTree.toolState.flipSwapTool();
      testStrokeAnimation();
    });

    it('delete enabled mouse enter', () => {
      dependencyTree.toolState.flipDeleteTool();
      testStrokeAnimation();
    });

    it('move node enabled mouse enter', () => {
      dependencyTree.toolState.flipMoveNodeTool([treeNode]);

      treeNode.konvaObject.fire('mouseenter');
      expect(konvaContainer.style.cursor).toBe('grab');
    });

    it('move node enabled mouse leave settings button (should remember cursor)', () => {
      dependencyTree.toolState.flipMoveNodeTool([treeNode]);

      treeNode.konvaObject.fire('mouseenter');
      expect(konvaContainer.style.cursor).toBe('grab');

      const settingsBtn = getSettingsButton();
      settingsBtn.fire('mouseenter');

      expect(konvaContainer.style.cursor).toBe('pointer');

      // Now we expect cursor to return back to grab since it is still inside the node
      settingsBtn.fire('mouseleave');
      expect(konvaContainer.style.cursor).toBe('grab');
    });

    it('should reset cursor to default on mouse leave', () => {
      dependencyTree.toolState.flipDeleteTool();
      testCursorReset('pointer');

      dependencyTree.toolState.flipSwapTool();
      testCursorReset('pointer');

      dependencyTree.toolState.flipMoveNodeTool([treeNode]);
      testCursorReset('grab');
    });

    it('should move node to top on dragstart', () => {
      spyOn(treeNode.konvaObject, 'moveToTop');

      treeNode.konvaObject.fire('dragstart');
      expect(treeNode.konvaObject.moveToTop).toHaveBeenCalled();
    });

    it('should update all edges on drag move', () => {
      spyOn(treeNode, 'updateEdges');
      treeNode.konvaObject.fire('dragmove');
      expect(treeNode.updateEdges).toHaveBeenCalled();
    });

    it('swap enabled click', () => {
      dependencyTree.toolState.flipSwapTool();
      spyOn(treeNode.strokeAnimation, 'deactivate');
      spyOn(dependencyTree.cursorState, 'resetCursor');
      spyOn(dependencyTree.treeNodeManager, 'moveToDispenser');
      spyOn(treeNode, 'unattach');

      const rect = getNodeRect();
      rect.fire('click');

      // Has to deactivate stroke and reset cursor so that the state is reset when user swaps the node back onto canvas.
      expect(treeNode.strokeAnimation.deactivate).toHaveBeenCalled();
      expect(dependencyTree.cursorState.resetCursor).toHaveBeenCalled();

      // Should move node into dispenser.
      expect(dependencyTree.treeNodeManager.moveToDispenser).toHaveBeenCalledWith(treeNode);

      // Node should be only unattached from the canvas so it can be used again.
      expect(treeNode.unattach).toHaveBeenCalled();
    });

    it('delete enabled click', () => {
      dependencyTree.toolState.flipDeleteTool();
      spyOn(dependencyTree.treeNodeManager, 'removeNode');
      spyOn(treeNode, 'destroy');
      spyOn(dependencyTree.cursorState, 'resetCursor');

      const rect = getNodeRect();
      rect.fire('click');

      // Cryton node should be destroyed because it won't be used again.
      expect(treeNode.destroy).toHaveBeenCalled();

      // Should reset cursor so that it doesn't stay glitched after node disappears.
      expect(dependencyTree.cursorState.resetCursor).toHaveBeenCalled();
    });
  });

  it('should change name correctly', () => {
    const nameText = getNameText();
    const newName = 'newName';
    expect(nameText.text()).toBe(DEFAULT_NAME);

    treeNode.changeName(newName);
    expect(nameText.text()).toBe(newName);
  });

  it('should change theme correctly', () => {
    const newTheme = JSON.parse(JSON.stringify(mockTheme)) as Theme;

    newTheme.primary = '#12345';
    newTheme.templateCreator.treeNodeRect = '#23456';

    treeNode.changeTheme(newTheme);

    const nodeRect = getNodeRect();
    const connectorCircle = getConnectorCircle();

    expect(nodeRect.fill()).toBe(newTheme.templateCreator.treeNodeRect);
    expect(connectorCircle.fill()).toBe(newTheme.primary);
  });

  it('should update points of all child and parent edges', () => {
    treeNode.parentEdges.push(stepEdgeStub, stepEdgeStub, stepEdgeStub);
    treeNode.childEdges.push(stepEdgeStub, stepEdgeStub);

    treeNode.updateEdges();
    expect(stepEdgeStub.moveToParentNode).toHaveBeenCalledTimes(2);
    expect(stepEdgeStub.moveToChildNode).toHaveBeenCalledTimes(3);
  });

  it('should draw the node in konva', () => {
    spyOn(treeNode.konvaObject, 'draw');
    treeNode.draw();

    expect(treeNode.konvaObject.draw).toHaveBeenCalled();
  });
});
