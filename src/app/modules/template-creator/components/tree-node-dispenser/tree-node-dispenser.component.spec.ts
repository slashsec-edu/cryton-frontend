import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TreeNodeDispenserComponent } from './tree-node-dispenser.component';
import { TemplateCreatorModule } from '../../template-creator.module';
import { DependencyTreeManagerService } from '../../services/dependency-tree-manager.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TreeNode } from '../../classes/dependency-tree/node/tree-node';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { AlertService } from 'src/app/services/alert.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';

describe('TreeNodeDispenserComponent', () => {
  let component: TreeNodeDispenserComponent;
  let fixture: ComponentFixture<TreeNodeDispenserComponent>;
  let loader: HarnessLoader;

  const moveToDispenser$ = new Subject<TreeNode>();
  const depTreeStub = {
    theme: mockTheme,
    treeNodeManager: {
      addNode: () => {},
      moveToDispenser$: moveToDispenser$.asObservable()
    }
  };

  // Mocks the tree manager and always returns an observable of fake dep. tree.
  const treeManagerStub = jasmine.createSpyObj('DependencyTreeManagerService', [
    'getCurrentTree',
    'observeDispenser',
    'removeDispenserNode',
    'addDispenserNode'
  ]) as Spied<DependencyTreeManagerService>;

  treeManagerStub.getCurrentTree.and.returnValue(of(depTreeStub));

  const dispenser$ = new BehaviorSubject<TreeNode[]>([]);
  treeManagerStub.observeDispenser.and.returnValue(dispenser$.asObservable());

  // Mocks the TreeNode, we only need name attribute in dispenser.
  const fakeNode = jasmine.createSpyObj('TreeNode', [], { name: 'testing step' }) as TreeNode;

  /**
   * Expects that DOM contains a given count of nodes.
   *
   * @param count Expected node count.
   */
  const expectNodeCount = (count: number): void => {
    const nativeEl = fixture.nativeElement as HTMLElement;
    const nodes = nativeEl.querySelectorAll('.node-body');

    expect(nodes.length).toEqual(count);
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TreeNodeDispenserComponent],
        imports: [TemplateCreatorModule],
        providers: [
          { provide: DependencyTreeManagerService, useValue: treeManagerStub },
          { provide: AlertService, useValue: alertServiceStub }
        ]
      })
        .overrideComponent(TreeNodeDispenserComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeNodeDispenserComponent);

    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    dispenser$.next([]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show fallback message if there are no nodes', () => {
    const nativeEl = fixture.nativeElement as HTMLElement;
    const header = nativeEl.querySelector('h2');

    expect(header).toBeTruthy();
  });

  it('should show nodes if there are some', () => {
    for (let i = 1; i < 4; i++) {
      const nodeArray = Array(i).fill(fakeNode);
      dispenser$.next(nodeArray);
      fixture.detectChanges();
      expectNodeCount(i);
    }
  });

  it('should swap node to the tree on swap click', async () => {
    dispenser$.next([fakeNode]);
    fixture.detectChanges();

    spyOn(depTreeStub.treeNodeManager, 'addNode');
    const swapButton = await loader.getHarness(MatButtonHarness);
    await swapButton.click();

    expect(depTreeStub.treeNodeManager.addNode).toHaveBeenCalled();
  });
});
