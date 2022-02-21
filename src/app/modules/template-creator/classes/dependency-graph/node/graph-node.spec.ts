import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import Konva from 'konva';
import { of } from 'rxjs';
import { KonvaContainerComponent } from 'src/app/testing/components/konva-container.component';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { NodeType } from '../../../models/enums/node-type';
import { Theme } from '../../../models/interfaces/theme';
import { DependencyGraph } from '../dependency-graph';
import { StepEdge } from '../edge/step-edge';
import { CONNECTOR_CIRCLE_NAME, CONNECTOR_NAME } from '../node-connector';
import { SETTINGS_BTN_NAME } from '../settings-button';
import { GraphNode, GRAPH_NODE_RECT_NAME, GRAPH_NODE_TEXT_NAME, NODE_HEIGHT, NODE_WIDTH } from './graph-node';
import { StepNode } from './step-node';

const DEFAULT_NAME = 'test';

describe('GraphNode', () => {
  let fixture: ComponentFixture<KonvaContainerComponent>;
  let component: KonvaContainerComponent;

  // Testing primarily with StepNode for methods which don't depend on node type.
  let dependencyGraph: DependencyGraph;
  let graphNode: GraphNode;

  // Use stepEdgeStub to mock parent / child edges.
  const stepEdgeStub = jasmine.createSpyObj('StepEdge', ['moveToParentNode', 'moveToChildNode']) as StepEdge;

  const createStep = (name: string) => {
    graphNode = new StepNode(name, '', '');
    graphNode.setParentDepGraph(dependencyGraph);
  };

  // const createStage = (name: string) => {
  //   graphNode = new StageNode({
  //     name,
  //     childDepGraph: new DependencyGraph(NodeType.CRYTON_STEP),
  //     timeline: new TemplateTimeline(),
  //     trigger: TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 0 })
  //   });
  //   graphNode.setParentDepGraph(dependencyGraph);
  // };

  const getNameText = (): Konva.Text => graphNode.konvaObject.findOne(`.${GRAPH_NODE_TEXT_NAME}`);
  const getNodeRect = (): Konva.Rect => graphNode.konvaObject.findOne(`.${GRAPH_NODE_RECT_NAME}`);
  const getConnector = (): Konva.Group => graphNode.konvaObject.findOne(`.${CONNECTOR_NAME}`);
  const getConnectorCircle = (): Konva.Circle => getConnector().findOne(`.${CONNECTOR_CIRCLE_NAME}`);
  const getSettingsButton = (): Konva.Group => graphNode.konvaObject.findOne(`.${SETTINGS_BTN_NAME}`);

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KonvaContainerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    dependencyGraph = new DependencyGraph(NodeType.CRYTON_STEP);
    createStep(DEFAULT_NAME);
  });

  describe('Initialization tests', () => {
    it('should create', () => {
      expect(graphNode).toBeTruthy();
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
      spyOn(graphNode.strokeAnimation, 'activate');

      graphNode.konvaObject.fire('mouseenter');

      expect(konvaContainer.style.cursor).toBe('pointer');
      expect(graphNode.strokeAnimation.activate).toHaveBeenCalled();
    };

    const testCursorReset = (expectedTempCursor: string): void => {
      graphNode.konvaObject.fire('mouseenter');
      expect(konvaContainer.style.cursor).toBe(expectedTempCursor);
      graphNode.konvaObject.fire('mouseleave');
      expect(konvaContainer.style.cursor).toBe('default');
    };

    beforeEach(() => {
      fixture = TestBed.createComponent(KonvaContainerComponent);
      component = fixture.componentInstance;

      component.afterInit = () => dependencyGraph.initKonva(component.konvaContainer.nativeElement, of(mockTheme));
      fixture.detectChanges();

      konvaContainer = component.konvaContainer.nativeElement as HTMLDivElement;
      dependencyGraph.addNode(graphNode);
    });

    it('swap enabled mouse enter', () => {
      dependencyGraph.toolState.flipSwapTool();
      testStrokeAnimation();
    });

    it('delete enabled mouse enter', () => {
      dependencyGraph.toolState.flipDeleteTool();
      testStrokeAnimation();
    });

    it('move node enabled mouse enter', () => {
      dependencyGraph.toolState.flipMoveNodeTool([graphNode]);

      graphNode.konvaObject.fire('mouseenter');
      expect(konvaContainer.style.cursor).toBe('grab');
    });

    it('move node enabled mouse leave settings button (should remember cursor)', () => {
      dependencyGraph.toolState.flipMoveNodeTool([graphNode]);

      graphNode.konvaObject.fire('mouseenter');
      expect(konvaContainer.style.cursor).toBe('grab');

      const settingsBtn = getSettingsButton();
      settingsBtn.fire('mouseenter');

      expect(konvaContainer.style.cursor).toBe('pointer');

      // Now we expect cursor to return back to grab since it is still inside the node
      settingsBtn.fire('mouseleave');
      expect(konvaContainer.style.cursor).toBe('grab');
    });

    it('should reset cursor to default on mouse leave', () => {
      dependencyGraph.toolState.flipDeleteTool();
      testCursorReset('pointer');

      dependencyGraph.toolState.flipSwapTool();
      testCursorReset('pointer');

      dependencyGraph.toolState.flipMoveNodeTool([graphNode]);
      testCursorReset('grab');
    });

    it('should move node to top on dragstart', () => {
      spyOn(graphNode.konvaObject, 'moveToTop');

      graphNode.konvaObject.fire('dragstart');
      expect(graphNode.konvaObject.moveToTop).toHaveBeenCalled();
    });

    it('should update all edges on drag move', () => {
      spyOn(graphNode, 'updateEdges');
      graphNode.konvaObject.fire('dragmove');
      expect(graphNode.updateEdges).toHaveBeenCalled();
    });

    it('swap enabled click', () => {
      dependencyGraph.toolState.flipSwapTool();
      spyOn(graphNode.strokeAnimation, 'deactivate');
      spyOn(dependencyGraph.cursorState, 'resetCursor');
      spyOn(dependencyGraph.graphNodeManager, 'moveToDispenser');
      spyOn(graphNode, 'unattach');

      const rect = getNodeRect();
      rect.fire('click');

      // Has to deactivate stroke and reset cursor so that the state is reset when user swaps the node back onto canvas.
      expect(graphNode.strokeAnimation.deactivate).toHaveBeenCalled();
      expect(dependencyGraph.cursorState.resetCursor).toHaveBeenCalled();

      // Should move node into dispenser.
      expect(dependencyGraph.graphNodeManager.moveToDispenser).toHaveBeenCalledWith(graphNode);

      // Node should be only unattached from the canvas so it can be used again.
      expect(graphNode.unattach).toHaveBeenCalled();
    });

    it('delete enabled click', () => {
      dependencyGraph.toolState.flipDeleteTool();
      spyOn(dependencyGraph.graphNodeManager, 'removeNode');
      spyOn(graphNode, 'destroy');
      spyOn(dependencyGraph.cursorState, 'resetCursor');

      const rect = getNodeRect();
      rect.fire('click');

      // Cryton node should be destroyed because it won't be used again.
      expect(graphNode.destroy).toHaveBeenCalled();

      // Should reset cursor so that it doesn't stay glitched after node disappears.
      expect(dependencyGraph.cursorState.resetCursor).toHaveBeenCalled();
    });
  });

  it('should change name correctly', () => {
    const nameText = getNameText();
    const newName = 'newName';
    expect(nameText.text()).toBe(DEFAULT_NAME);

    graphNode.changeName(newName);
    expect(nameText.text()).toBe(newName);
  });

  it('should change theme correctly', () => {
    const newTheme = JSON.parse(JSON.stringify(mockTheme)) as Theme;

    newTheme.primary = '#12345';
    newTheme.templateCreator.graphNodeRect = '#23456';

    graphNode.changeTheme(newTheme);

    const nodeRect = getNodeRect();
    const connectorCircle = getConnectorCircle();

    expect(nodeRect.fill()).toBe(newTheme.templateCreator.graphNodeRect);
    expect(connectorCircle.fill()).toBe(newTheme.primary);
  });

  it('should update points of all child and parent edges', () => {
    graphNode.parentEdges.push(stepEdgeStub, stepEdgeStub, stepEdgeStub);
    graphNode.childEdges.push(stepEdgeStub, stepEdgeStub);

    graphNode.updateEdges();
    expect(stepEdgeStub.moveToParentNode).toHaveBeenCalledTimes(2);
    expect(stepEdgeStub.moveToChildNode).toHaveBeenCalledTimes(3);
  });

  it('should draw the node in konva', () => {
    spyOn(graphNode.konvaObject, 'draw');
    graphNode.draw();

    expect(graphNode.konvaObject.draw).toHaveBeenCalled();
  });
});
