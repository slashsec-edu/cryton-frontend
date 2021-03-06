import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { CrytonButtonHarness } from 'src/app/modules/shared/components/cryton-button/cryton-button.harness';
import { AlertService } from 'src/app/services/alert.service';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { Spied } from 'src/app/testing/utility/utility-types';
import { DependencyGraph } from '../../classes/dependency-graph/dependency-graph';
import { NodeManager } from '../../classes/dependency-graph/node-manager';
import { GraphNode } from '../../classes/dependency-graph/node/graph-node';
import { StageNode } from '../../classes/dependency-graph/node/stage-node';
import { StepNode } from '../../classes/dependency-graph/node/step-node';
import { HttpTriggerForm } from '../../classes/stage-creation/forms/http-form';
import { TemplateTimeline } from '../../classes/timeline/template-timeline';
import { Trigger, TriggerArgs } from '../../classes/triggers/trigger';
import { TriggerFactory } from '../../classes/triggers/trigger-factory';
import { NodeType } from '../../models/enums/node-type';
import { TriggerType } from '../../models/enums/trigger-type';
import { HTTPListenerArgs } from '../../models/interfaces/http-listener-args';
import { DependencyGraphManagerService, DepGraphRef } from '../../services/dependency-graph-manager.service';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { TemplateCreatorModule } from '../../template-creator.module';
import { CREATION_MSG_TIMEOUT, StageCreatorComponent } from './stage-creator.component';

describe('StageCreatorComponent', () => {
  let component: StageCreatorComponent;
  let fixture: ComponentFixture<StageCreatorComponent>;
  let loader: HarnessLoader;

  // Graphs and timelines
  let parentDepGraph: DependencyGraph;
  let parentTimeline: TemplateTimeline;
  let emptyChildDepGraph: DependencyGraph;
  let correctChildDepGraph: DependencyGraph;

  // Stage config
  let triggerConfig: TriggerArgs;
  let trigger: Trigger<TriggerArgs>;
  let correctStage: StageNode;

  // Subjects emmiting new dependency graphs from graph manager spy.
  const childDepGraph$ = new BehaviorSubject<DependencyGraph>(null);
  const fakeEditNode$ = new ReplaySubject<GraphNode | undefined>(1);

  /**
   * Spy node manager, needed to return the fake edit node subject.
   */
  const nodeManagerSpy = jasmine.createSpyObj('NodeManager', [
    'isNodeNameUnique',
    'clearEditNode',
    'moveToDispenser'
  ]) as Spied<NodeManager>;
  nodeManagerSpy.isNodeNameUnique.and.returnValue(true);
  nodeManagerSpy.clearEditNode.and.callFake(() => fakeEditNode$.next(null));

  const parentDepGraphSpy = jasmine.createSpyObj('DependencyGraph', [], {
    graphNodeManager: nodeManagerSpy
  }) as Spied<DependencyGraph>;

  const graphManagerSpy = jasmine.createSpyObj('DependencyGraphManagerService', [
    'getCurrentGraph',
    'resetCurrentGraph',
    'editGraph',
    'restoreGraph',
    'addDispenserNode',
    'observeNodeEdit',
    'refreshDispenser'
  ]) as Spied<DependencyGraphManagerService>;
  graphManagerSpy.getCurrentGraph.and.callFake((graphRef: DepGraphRef) => {
    if (graphRef === DepGraphRef.TEMPLATE_CREATION) {
      return new BehaviorSubject(parentDepGraphSpy);
    } else {
      return childDepGraph$;
    }
  });
  graphManagerSpy.observeNodeEdit.and.returnValue(fakeEditNode$.asObservable());

  const tcState = new TemplateCreatorStateService(graphManagerSpy as unknown as DependencyGraphManagerService);
  const matDialogStub = jasmine.createSpyObj('MatDialog', ['open']) as Spied<MatDialog>;

  /**
   * Fills stage creator with valid stage data (valid for creation).
   */
  const fillWithCorrectStage = (): void => {
    component.stageForm.fill(correctStage);
    childDepGraph$.next(correctChildDepGraph);
    fixture.detectChanges();
  };

  // Getters for creator buttons
  const getCreateBtn = (): Promise<CrytonButtonHarness> =>
    loader.getHarness(CrytonButtonHarness.with({ text: /.*Create stage/ })) as Promise<CrytonButtonHarness>;

  const getCancelBtn = (): Promise<CrytonButtonHarness> =>
    loader.getHarness(CrytonButtonHarness.with({ text: /.*Cancel/ })) as Promise<CrytonButtonHarness>;

  const getSaveChangesBtn = (): Promise<CrytonButtonHarness> =>
    loader.getHarness(CrytonButtonHarness.with({ text: /.*Save changes/ })) as Promise<CrytonButtonHarness>;

  /**
   * Expects that stage form and child dep graph have been erased.
   * You have to spyOn the stageForm before using this function.
   */
  const expectCreatorReset = (): void => {
    expect(component.stageForm.erase).toHaveBeenCalled();
    expect(graphManagerSpy.resetCurrentGraph).toHaveBeenCalled();
  };

  const createDeltaStage = (name: string): StageNode => {
    childDepGraph$.next(correctChildDepGraph);
    triggerConfig = { hours: 1, minutes: 2, seconds: 3 };
    trigger = TriggerFactory.createTrigger(TriggerType.DELTA, triggerConfig);
    const node = new StageNode({
      name,
      childDepGraph: correctChildDepGraph,
      timeline: parentTimeline,
      trigger
    });
    node.setParentDepGraph(parentDepGraph);
    return node;
  };

  const createHttpStage = (name: string): StageNode => {
    childDepGraph$.next(correctChildDepGraph);
    triggerConfig = {
      host: '127.0.0.1',
      port: 80,
      routes: [{ path: 'api', method: 'GET', parameters: [{ name: 'value', value: 'test' }] }]
    };
    trigger = TriggerFactory.createTrigger(TriggerType.HTTP_LISTENER, triggerConfig);
    const node = new StageNode({
      name,
      childDepGraph: correctChildDepGraph,
      timeline: parentTimeline,
      trigger
    });
    node.setParentDepGraph(parentDepGraph);
    return node;
  };

  const createState = (): void => {
    // Stage environment needed to create a stage.
    parentTimeline = new TemplateTimeline();
    parentDepGraph = new DependencyGraph(NodeType.CRYTON_STAGE);

    // Empty child dependency graph for testing invalid stages.
    emptyChildDepGraph = new DependencyGraph(NodeType.CRYTON_STEP);

    // Correctly created dependency graph for testing valid stages.
    correctChildDepGraph = new DependencyGraph(NodeType.CRYTON_STEP);
    correctChildDepGraph.theme = mockTheme;
    const testingStep = new StepNode('testStep', 'module', 'args');
    testingStep.setParentDepGraph(correctChildDepGraph);
    correctChildDepGraph.graphNodeManager.addNode(testingStep);

    // Initializing subjects
    childDepGraph$.next(emptyChildDepGraph);

    // Fake edit node observable for testing stage editing.
    fakeEditNode$.next(undefined);
  };
  createState();

  const runStageTests = (): void => {
    it('should enable create button when stage is correctly created', async () => {
      fillWithCorrectStage();

      const createBtn = await getCreateBtn();

      expect(await createBtn.isDisabled()).toBeFalse();
    });

    it('should create the stage correctly', fakeAsync(async () => {
      fillWithCorrectStage();
      await getCreateBtn().then(btn => btn.click());
      tick(CREATION_MSG_TIMEOUT);

      expect(graphManagerSpy.addDispenserNode).toHaveBeenCalled();
    }));

    it('should correctly load edited delta stage into editor', () => {
      fakeEditNode$.next(correctStage);
      fixture.detectChanges();

      expect(component.stageForm.getStageArgs()).toEqual({
        name: correctStage.name,
        triggerType: correctStage.trigger.getType()
      });
      expect(component.stageForm.getTriggerArgs()).toEqual(triggerConfig);
      expect(graphManagerSpy.editGraph).toHaveBeenCalledWith(DepGraphRef.STAGE_CREATION, correctChildDepGraph, true);
    });

    it('should erase state after creation', fakeAsync(async () => {
      fillWithCorrectStage();
      spyOn(component.stageForm, 'erase');
      await getCreateBtn().then(btn => btn.click());
      tick(CREATION_MSG_TIMEOUT);

      expectCreatorReset();
    }));

    it('should erase state after click on cancel button', async () => {
      // TODO: Chceck also the form inputs in the DOM.
      fakeEditNode$.next(correctStage);
      fixture.detectChanges();

      spyOn(component, 'cancelEditing');
      await getCancelBtn().then(btn => btn.click());

      fakeEditNode$.next(undefined);
      component.cancelEditing();
      fixture.detectChanges();

      expect(component.cancelEditing).toHaveBeenCalled();
    });
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StageCreatorComponent],
        imports: [TemplateCreatorModule, BrowserAnimationsModule],
        providers: [
          { provide: AlertService, useValue: alertServiceStub },
          { provide: DependencyGraphManagerService, useValue: graphManagerSpy },
          { provide: TemplateCreatorStateService, useValue: tcState },
          { provide: MatDialog, useValue: matDialogStub }
        ]
      })
        .overrideComponent(StageCreatorComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    tcState.clear();
    fixture = TestBed.createComponent(StageCreatorComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    createState();

    fixture.detectChanges();

    component.stageForm.erase();
    component.stageForm.editedNodeName = null;
    component.editedStage = null;

    fixture.detectChanges();
  });

  describe('Stage agnostic specs', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should disable create button if the stage is empty', async () => {
      const createBtn = await getCreateBtn();
      expect(await createBtn.isDisabled()).toBeTrue();
    });
  });

  describe('Stage editing tests', () => {
    const editedDeltaStageArgs = { name: 'editedDeltaStage', triggerType: TriggerType.DELTA };
    const editedDeltaTriggerArgs = { hours: 777, minutes: 59, seconds: 59 };
    const editedHttpStageArgs = { name: 'editedHttpStage', triggerType: TriggerType.HTTP_LISTENER };
    const editedHttpTriggerArgs: HTTPListenerArgs = {
      host: '1.1.1.1',
      port: 9999,
      routes: [{ path: '/', method: 'GET', parameters: [{ name: 'is_edited', value: 'true' }] }]
    };

    const fillDeltaForm = () => {
      component.stageForm.getStageArgsForm().setValue(editedDeltaStageArgs);
      fixture.detectChanges();
      (component.stageForm.getTriggerArgsForm() as FormGroup).setValue(editedDeltaTriggerArgs);
    };

    const fillHttpForm = () => {
      component.stageForm.getStageArgsForm().setValue(editedHttpStageArgs);
      fixture.detectChanges();

      const httpTriggerForm = component.stageForm.getTriggerArgsForm() as HttpTriggerForm;
      const editedRoute = editedHttpTriggerArgs.routes[0];
      const editedParam = editedHttpTriggerArgs.routes[0].parameters[0];

      httpTriggerForm.args.setValue({ host: editedHttpTriggerArgs.host, port: editedHttpTriggerArgs.port });
      httpTriggerForm.routes[0].args.setValue({
        method: editedRoute.method,
        path: editedRoute.path
      });
      httpTriggerForm.routes[0].parameters[0].setValue({
        name: editedParam.name,
        value: editedParam.value
      });
    };

    it('should not load stage into editor if the same stage is currently being edited', () => {
      const stage = createDeltaStage('deltaStage');

      fakeEditNode$.next(stage);
      fillDeltaForm();
      fakeEditNode$.next(stage);

      expect(component.stageForm.getStageArgs()).toEqual(editedDeltaStageArgs);
      expect(component.stageForm.getTriggerArgs()).toEqual(editedDeltaTriggerArgs);
    });

    it('should not backup stage form of edited stage', () => {
      const stage1 = createDeltaStage('stage1');
      const stage2 = createDeltaStage('stage2');

      fakeEditNode$.next(stage1);
      spyOn(tcState, 'backupStageForm');
      fakeEditNode$.next(stage2);

      expect(tcState.backupStageForm).not.toHaveBeenCalled();
    });

    it('should erase form after canceling editing if there is no backup', async () => {
      const stage1 = createDeltaStage('stage1');
      fakeEditNode$.next(stage1);

      await getCancelBtn().then(btn => btn.click());

      expect(component.stageForm.isNotEmpty()).toBeFalse();
    });

    it('should back up form state before editing a node', () => {
      fillDeltaForm();

      spyOn(tcState, 'backupStageForm');
      const stage1 = createDeltaStage('stage1');
      fakeEditNode$.next(stage1);

      expect(tcState.backupStageForm).toHaveBeenCalled();
    });

    it('should load backed up form state after cancelling editing', async () => {
      fillDeltaForm();

      const stage1 = createDeltaStage('stage1');
      fakeEditNode$.next(stage1);

      await getCancelBtn().then(btn => btn.click());
      expect(component.stageForm.getStageArgs()).toEqual(editedDeltaStageArgs);
      expect(component.stageForm.getTriggerArgs()).toEqual(editedDeltaTriggerArgs);
    });

    it('should load backed up form state after saving changes', async () => {
      fillDeltaForm();

      const stage1 = createDeltaStage('stage1');
      fakeEditNode$.next(stage1);
      fixture.detectChanges();

      await getSaveChangesBtn().then(btn => btn.click());
      expect(component.stageForm.getStageArgs()).toEqual(editedDeltaStageArgs);
      expect(component.stageForm.getTriggerArgs()).toEqual(editedDeltaTriggerArgs);
    });

    it('should edit delta stage to http listener stage', async () => {
      const stage1 = createDeltaStage('stage1');
      fakeEditNode$.next(stage1);
      fixture.detectChanges();

      fillHttpForm();

      await getSaveChangesBtn().then(btn => btn.click());
      expect(stage1.name).toBe(editedHttpStageArgs.name);
      expect(stage1.trigger.getType()).toEqual(editedHttpStageArgs.triggerType);
      expect(stage1.trigger.getArgs()).toEqual(editedHttpTriggerArgs);
    });

    it('should edit http listener stage to delta stage', async () => {
      const stage1 = createHttpStage('stage1');
      fakeEditNode$.next(stage1);
      fixture.detectChanges();

      fillDeltaForm();

      await getSaveChangesBtn().then(btn => btn.click());
      expect(stage1.name).toBe(editedDeltaStageArgs.name);
      expect(stage1.trigger.getType()).toBe(editedDeltaStageArgs.triggerType);
      expect(stage1.trigger.getArgs()).toEqual(editedDeltaTriggerArgs);
    });
  });

  describe('Delta trigger specs', () => {
    beforeEach(() => {
      correctStage = createDeltaStage('deltaStage');
    });

    runStageTests();
  });

  describe('HTTP listener trigger specs', () => {
    beforeEach(() => {
      correctStage = createHttpStage('httpStage');
    });

    runStageTests();
  });
});
