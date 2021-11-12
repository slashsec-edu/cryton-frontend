import Konva from 'konva';
import { NodeType } from '../../models/enums/node-type';
import { CrytonStep } from '../cryton-node/cryton-step';
import { DependencyTree } from './dependency-tree';
import { CONNECTOR_CIRCLE_NAME, CONNECTOR_NAME } from './node-connector';
import { NODE_HEIGHT, NODE_WIDTH, TreeNode, TREE_NODE_RECT_NAME, TREE_NODE_TEXT_NAME } from './tree-node';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { Theme } from '../../models/interfaces/theme';
import { TreeEdge } from './tree-edge';
import { CrytonStepEdge } from '../cryton-edge/cryton-step-edge';
import { Tabs, TabsRouter } from '../utils/tabs-router';
import { SETTINGS_BTN_NAME } from './settings-button';
import { CrytonNode } from '../cryton-node/cryton-node';
import { CrytonStage } from '../cryton-node/cryton-stage';
import { TemplateTimeline } from '../timeline/template-timeline';
import { TriggerFactory } from '../cryton-node/triggers/trigger-factory';
import { TriggerType } from '../../models/enums/trigger-type';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KonvaContainerComponent } from 'src/app/testing/components/konva-container.component';
import { of } from 'rxjs';

const DEFAULT_NAME = 'test';

describe('TreeNode', () => {
  let fixture: ComponentFixture<KonvaContainerComponent>;
  let component: KonvaContainerComponent;

  // Testing primarily with CrytonStep for methods which don't depend on node type.
  let dependencyTree: DependencyTree;
  let crytonNode: CrytonNode;
  let treeNode: TreeNode;

  // Use stepEdgeStub to mock parent / child edges.
  const edgeStub = jasmine.createSpyObj('TreeEdge', ['moveToParentNode', 'moveToChildNode']) as TreeEdge;
  const stepEdgeStub = jasmine.createSpyObj('CrytonStepEdge', [], { treeEdge: edgeStub }) as CrytonStepEdge;

  const createStep = (name: string) => {
    crytonNode = new CrytonStep(name, '', '', dependencyTree);
    treeNode = crytonNode.treeNode;
  };

  const createStage = (name: string) => {
    crytonNode = new CrytonStage({
      name,
      parentDepTree: dependencyTree,
      childDepTree: new DependencyTree(NodeType.CRYTON_STEP),
      timeline: new TemplateTimeline(),
      trigger: TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 0 })
    });
    treeNode = crytonNode.treeNode;
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

  describe('Settings button click', () => {
    let settingsBtn: Konva.Group;

    beforeEach(() => {
      settingsBtn = getSettingsButton();
      spyOn(TabsRouter, 'selectIndex');
      spyOn(dependencyTree.treeNodeManager, 'editNode');
    });

    it('should re-route to stage creation', () => {
      settingsBtn.fire('click');
      expect(TabsRouter.selectIndex).toHaveBeenCalledWith(Tabs.CREATE_STEP);
    });

    it('should re-route to stage creation', () => {
      createStage('test');

      // settingsBtn points to button in step not stage
      settingsBtn = getSettingsButton();
      settingsBtn.fire('click');
      expect(TabsRouter.selectIndex).toHaveBeenCalledWith(Tabs.CREATE_STAGE);
    });

    it('should init. editing of node in dependency tree', () => {
      settingsBtn.fire('click');
      expect(dependencyTree.treeNodeManager.editNode).toHaveBeenCalledWith(crytonNode);
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
      dependencyTree.addNode(crytonNode);
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
      dependencyTree.toolState.flipMoveNodeTool([crytonNode]);

      treeNode.konvaObject.fire('mouseenter');
      expect(konvaContainer.style.cursor).toBe('grab');
    });

    it('move node enabled mouse leave settings button (should remember cursor)', () => {
      dependencyTree.toolState.flipMoveNodeTool([crytonNode]);

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

      dependencyTree.toolState.flipMoveNodeTool([crytonNode]);
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
      spyOn(crytonNode, 'unattach');

      const rect = getNodeRect();
      rect.fire('click');

      // Has to deactivate stroke and reset cursor so that the state is reset when user swaps the node back onto canvas.
      expect(treeNode.strokeAnimation.deactivate).toHaveBeenCalled();
      expect(dependencyTree.cursorState.resetCursor).toHaveBeenCalled();

      // Should move node into dispenser.
      expect(dependencyTree.treeNodeManager.moveToDispenser).toHaveBeenCalledWith(crytonNode);

      // Node should be only unattached from the canvas so it can be used again.
      expect(crytonNode.unattach).toHaveBeenCalled();
    });

    it('delete enabled click', () => {
      dependencyTree.toolState.flipDeleteTool();
      spyOn(dependencyTree.treeNodeManager, 'removeCanvasNode');
      spyOn(crytonNode, 'destroy');
      spyOn(dependencyTree.cursorState, 'resetCursor');

      const rect = getNodeRect();
      rect.fire('click');

      // Should remove the node from canvas.
      expect(dependencyTree.treeNodeManager.removeCanvasNode).toHaveBeenCalledWith(crytonNode);

      // Cryton node should be destroyed because it won't be used again.
      expect(crytonNode.destroy).toHaveBeenCalled();

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
    crytonNode.parentEdges.push(stepEdgeStub, stepEdgeStub, stepEdgeStub);
    crytonNode.childEdges.push(stepEdgeStub, stepEdgeStub);

    treeNode.updateEdges();
    expect(edgeStub.moveToParentNode).toHaveBeenCalledTimes(2);
    expect(edgeStub.moveToChildNode).toHaveBeenCalledTimes(3);
  });

  it('should draw the node in konva', () => {
    spyOn(treeNode.konvaObject, 'draw');
    treeNode.draw();

    expect(treeNode.konvaObject.draw).toHaveBeenCalled();
  });
});
