import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TreeNodeDispenserComponent } from './tree-node-dispenser.component';
import { TemplateCreatorModule } from '../../template-creator.module';
import { DependencyTreeManagerService } from '../../services/dependency-tree-manager.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CrytonNode } from '../../classes/cryton-node/cryton-node';
import { ChangeDetectionStrategy } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

/**
 * Fake implementation of node manager for testing.
 */
class NodeManagerFake {
  dispenserNodes$: Observable<CrytonNode[]>;

  private _dispenserNodes$ = new BehaviorSubject<CrytonNode[]>([]);

  constructor() {
    this.dispenserNodes$ = this._dispenserNodes$.asObservable();
  }

  emitNodes(nodes: CrytonNode[]): void {
    this._dispenserNodes$.next(nodes);
  }

  moveToPlan(): void {}
}

/**
 * Fake implementation of DependencyTree, only needed to contain the fake node manager.
 */
class DepTreeFake {
  treeNodeManager = new NodeManagerFake();
}

describe('TreeNodeDispenserComponent', () => {
  let component: TreeNodeDispenserComponent;
  let fixture: ComponentFixture<TreeNodeDispenserComponent>;
  let loader: HarnessLoader;

  const depTreeFake = new DepTreeFake();

  // Mocks the tree manager and always returns an observable of fake dep. tree.
  const treeManagerStub = jasmine.createSpyObj('DependencyTreeManagerService', [
    'getCurrentTree'
  ]) as Spied<DependencyTreeManagerService>;

  treeManagerStub.getCurrentTree.and.returnValue(of(depTreeFake));

  // Mocks the CrytonNode, we only need name attribute in dispenser.
  const fakeNode = jasmine.createSpyObj('CrytonNode', [], { name: 'testing step' }) as CrytonNode;

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
        providers: [{ provide: DependencyTreeManagerService, useValue: treeManagerStub }]
      })
        .overrideComponent(TreeNodeDispenserComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeNodeDispenserComponent);

    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    depTreeFake.treeNodeManager.emitNodes([]);
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
      depTreeFake.treeNodeManager.emitNodes(nodeArray);
      fixture.detectChanges();
      expectNodeCount(i);
    }
  });

  it('should swap node to the tree on swap click', async () => {
    depTreeFake.treeNodeManager.emitNodes([fakeNode]);
    fixture.detectChanges();

    spyOn(depTreeFake.treeNodeManager, 'moveToPlan');
    const swapButton = await loader.getHarness(MatButtonHarness);
    await swapButton.click();

    expect(depTreeFake.treeNodeManager.moveToPlan).toHaveBeenCalled();
  });
});
