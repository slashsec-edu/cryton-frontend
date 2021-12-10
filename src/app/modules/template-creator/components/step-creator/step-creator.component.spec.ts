import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TemplateCreatorModule } from '../../template-creator.module';
import { StepCreatorComponent } from './step-creator.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectionStrategy } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Spied } from 'src/app/testing/utility/utility-types';
import { DependencyTreeManagerService } from '../../services/dependency-tree-manager.service';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { BehaviorSubject, of } from 'rxjs';
import { NodeType } from '../../models/enums/node-type';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { StepNode } from '../../classes/dependency-tree/node/step-node';
import { TreeNode } from '../../classes/dependency-tree/node/tree-node';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonHarness } from '@angular/material/button/testing';

const EMPTY_FORM_VALUE = { name: null, attackModule: null, attackModuleArgs: null };
const TESTING_ARGS1 = { name: 'a1', attackModule: 'b1', attackModuleArgs: 'c1' };
const TESTING_ARGS2 = { name: 'a2', attackModule: 'b2', attackModuleArgs: 'c2' };

describe('StepCreatorComponent', () => {
  let component: StepCreatorComponent;
  let fixture: ComponentFixture<StepCreatorComponent>;
  let loader: HarnessLoader;

  const testingDepTree = new DependencyTree(NodeType.CRYTON_STEP);

  const createStep = (stepArgs: { name: string; attackModule: string; attackModuleArgs: string }): StepNode =>
    new StepNode(stepArgs.name, stepArgs.attackModule, stepArgs.attackModuleArgs, testingDepTree);

  const getCreateBtn = (): Promise<MatButtonHarness> =>
    loader.getHarness(MatButtonHarness.with({ text: /.*Create step/ }));

  const getCancelBtn = (): Promise<MatButtonHarness> => loader.getHarness(MatButtonHarness.with({ text: /.*Cancel/ }));

  const getSaveChangesBtn = (): Promise<MatButtonHarness> =>
    loader.getHarness(MatButtonHarness.with({ text: /.*Save changes/ }));

  /**
   * Fake subject for simulating edit node event.
   */
  const fakeEditNode$ = new BehaviorSubject<TreeNode>(null);

  /**
   * Spy node manager, needed to return the fake edit node subject.
   */
  const nodeManagerSpy = jasmine.createSpyObj('NodeManager', ['isNodeNameUnique', 'clearEditNode', 'moveToDispenser'], {
    editNode$: fakeEditNode$.asObservable()
  }) as Spied<NodeManager>;
  nodeManagerSpy.clearEditNode.and.callFake(() => {
    fakeEditNode$.next(null);
  });

  const depTreeSpy = jasmine.createSpyObj('DependencyTree', [], {
    treeNodeManager: nodeManagerSpy
  }) as Spied<DependencyTree>;

  /**
   * Spy dependency tree manager, needed to return the spy dependency tree.
   */
  const treeManagerSpy = jasmine.createSpyObj('DependencyTreeManagerService', [
    'getCurrentTree'
  ]) as Spied<DependencyTreeManagerService>;
  treeManagerSpy.getCurrentTree.and.returnValue(of(depTreeSpy));

  const matDialogStub = jasmine.createSpyObj('MatDialog', ['open']) as Spied<MatDialog>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [StepCreatorComponent],
        imports: [TemplateCreatorModule, BrowserAnimationsModule, NoopAnimationsModule],
        providers: [
          { provide: DependencyTreeManagerService, useValue: treeManagerSpy },
          { provide: AlertService, useValue: alertServiceStub },
          { provide: MatDialog, useValue: matDialogStub }
        ]
      })
        .overrideComponent(StepCreatorComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fakeEditNode$.next(null);
    fixture = TestBed.createComponent(StepCreatorComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;

    nodeManagerSpy.isNodeNameUnique.and.returnValue(true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the create button to disabled when form is incomplete', async () => {
    const createButton = await getCreateBtn();
    expect(await createButton.isDisabled()).toBeTruthy();

    component.stepForm.setValue(TESTING_ARGS1);
    fixture.detectChanges();

    expect(await createButton.isDisabled()).toBeFalsy();
  });

  it('should fill data of edited step into the form after editStep$ emits', () => {
    expect(component.stepForm.value).toEqual({ name: null, attackModule: null, attackModuleArgs: null });
    const step = createStep(TESTING_ARGS1);
    fakeEditNode$.next(step);
    expect(component.stepForm.value).toEqual(TESTING_ARGS1);
  });

  it('should cancel editing step correctly', async () => {
    const step = createStep({ name: 'once', attackModule: 'only', attackModuleArgs: 'pls' });
    fakeEditNode$.next(step);
    const saveChangesBtn = await getSaveChangesBtn();
    expect(saveChangesBtn).toBeDefined();

    nodeManagerSpy.clearEditNode();
    component.cancelEditing();

    expect(component.stepForm.value).toEqual(EMPTY_FORM_VALUE);
    expect(component.editedStep).toBeFalsy();

    const createBtn = await getCreateBtn();
    expect(createBtn).toBeDefined();
  });

  it('should disable create button when a step with same name already exists', async () => {
    nodeManagerSpy.isNodeNameUnique.and.returnValue(false);
    component.stepForm.setValue({ name: 'ha', attackModule: 'he', attackModuleArgs: 'hi' });

    const createBtn = await getCreateBtn();
    expect(await createBtn.isDisabled()).toBeTrue();
  });

  it('should create step correctly', async () => {
    component.stepForm.setValue(TESTING_ARGS1);
    await getCreateBtn().then(btn => btn.click());

    expect(nodeManagerSpy.moveToDispenser).toHaveBeenCalled();
  });

  it('should not load step into editor if the same step is currently being edited', () => {
    const step = createStep(TESTING_ARGS1);
    fakeEditNode$.next(step);

    const editedFormValue = { name: 'no_override1', attackModule: 'no_override2', attackModuleArgs: 'no_override3' };
    component.stepForm.setValue(editedFormValue);

    fakeEditNode$.next(step);

    expect(component.stepForm.value).toEqual(editedFormValue);
  });

  it('should not backup step form of edited step', () => {
    const step1 = createStep(TESTING_ARGS1);
    const step2 = createStep(TESTING_ARGS2);

    fakeEditNode$.next(step1);
    spyOn(component, 'backupStepForm');
    fakeEditNode$.next(step2);

    expect(component.backupStepForm).not.toHaveBeenCalled();
  });

  it('should reset form after canceling editing if there is no backup', async () => {
    const step1 = createStep(TESTING_ARGS1);
    const step2 = createStep(TESTING_ARGS2);
    fakeEditNode$.next(step1);
    fakeEditNode$.next(step2);

    await getCancelBtn().then(btn => btn.click());

    expect(component.stepForm.value).toEqual({ name: null, attackModule: null, attackModuleArgs: null });
  });

  it('should back up form state before editing a node', () => {
    const step1 = createStep(TESTING_ARGS1);
    const backedUpFormValue = { name: 'backup1', attackModule: 'backup2', attackModuleArgs: 'backup3' };
    component.stepForm.setValue(backedUpFormValue);

    spyOn(component, 'backupStepForm');
    fakeEditNode$.next(step1);

    expect(component.backupStepForm).toHaveBeenCalled();
  });

  it('should load backed up form state after cancelling editing', async () => {
    const step1 = createStep(TESTING_ARGS1);
    const backedUpFormValue = { name: 'backup1', attackModule: 'backup2', attackModuleArgs: 'backup3' };
    component.stepForm.setValue(backedUpFormValue);
    fakeEditNode$.next(step1);

    await getCancelBtn().then(btn => btn.click());

    expect(component.stepForm.value).toEqual(backedUpFormValue);
  });

  it('should load backed up form state after saving changes', async () => {
    const step1 = createStep(TESTING_ARGS1);
    const backedUpFormValue = { name: 'backup1', attackModule: 'backup2', attackModuleArgs: 'backup3' };
    component.stepForm.setValue(backedUpFormValue);
    fakeEditNode$.next(step1);

    await getSaveChangesBtn().then(btn => btn.click());
    fixture.detectChanges();

    expect(component.stepForm.value).toEqual(backedUpFormValue);
  });

  it('should correctly edit step', async () => {
    const step1 = createStep(TESTING_ARGS1);
    fakeEditNode$.next(step1);
    fixture.detectChanges();

    const editedStepArgs = { name: 'edited1', attackModule: 'edited2', attackModuleArgs: 'edited3' };
    component.stepForm.setValue(editedStepArgs);

    await getSaveChangesBtn().then(btn => btn.click());

    expect({ name: step1.name, attackModule: step1.attackModule, attackModuleArgs: step1.attackModuleArgs }).toEqual(
      editedStepArgs
    );
  });
});
