import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { GraphNodeDispenserComponent } from './graph-node-dispenser.component';
import { TemplateCreatorModule } from '../../template-creator.module';
import { DependencyGraphManagerService } from '../../services/dependency-graph-manager.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { ChangeDetectionStrategy } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { GraphNode } from '../../classes/dependency-graph/node/graph-node';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { AlertService } from 'src/app/services/alert.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';

describe('GraphNodeDispenserComponent', () => {
  let component: GraphNodeDispenserComponent;
  let fixture: ComponentFixture<GraphNodeDispenserComponent>;
  let loader: HarnessLoader;

  const moveToDispenser$ = new Subject<GraphNode>();
  const depGraphStub = {
    theme: mockTheme,
    graphNodeManager: {
      addNode: () => {},
      moveToDispenser$: moveToDispenser$.asObservable()
    }
  };

  // Mocks the graph manager and always returns an observable of fake dep. graph.
  const graphManagerStub = jasmine.createSpyObj('DependencyGraphManagerService', [
    'getCurrentGraph',
    'observeDispenser',
    'removeDispenserNode',
    'addDispenserNode'
  ]) as Spied<DependencyGraphManagerService>;

  graphManagerStub.getCurrentGraph.and.returnValue(of(depGraphStub));

  const dispenser$ = new BehaviorSubject<GraphNode[]>([]);
  graphManagerStub.observeDispenser.and.returnValue(dispenser$.asObservable());

  // Mocks the GraphNode, we only need name attribute in dispenser.
  const fakeNode = jasmine.createSpyObj('GraphNode', [], { name: 'testing step' }) as GraphNode;

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
        declarations: [GraphNodeDispenserComponent],
        imports: [TemplateCreatorModule],
        providers: [
          { provide: DependencyGraphManagerService, useValue: graphManagerStub },
          { provide: AlertService, useValue: alertServiceStub }
        ]
      })
        .overrideComponent(GraphNodeDispenserComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphNodeDispenserComponent);

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

  it('should swap node to the graph on swap click', async () => {
    dispenser$.next([fakeNode]);
    fixture.detectChanges();

    spyOn(depGraphStub.graphNodeManager, 'addNode');
    const swapButton = await loader.getHarness(MatButtonHarness);
    await swapButton.click();

    expect(depGraphStub.graphNodeManager.addNode).toHaveBeenCalled();
  });
});
