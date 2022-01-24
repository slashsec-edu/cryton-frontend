import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { Spied } from 'src/app/testing/utility/utility-types';
import { TemplateCreatorModule } from '../../template-creator.module';
import { EdgeParametersComponent } from './edge-parameters.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { EdgeCondition } from '../../models/interfaces/edge-condition';
import { ChangeDetectionStrategy } from '@angular/core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { StepEdge } from '../../classes/dependency-graph/edge/step-edge';
import { MatDialogModule } from '@angular/material/dialog';

class CrytonNodeFake {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  addChildEdge() {}
  addParentEdge() {}
  removeChildEdge() {}
  removeParentEdge() {}
}

class CrytonEdgeFake {
  parentNode: CrytonNodeFake;
  childNode: CrytonNodeFake;
  conditions: EdgeCondition[] = [];

  depGraph = {
    stage: {
      draw: () => {}
    }
  };

  constructor(parent: CrytonNodeFake, child: CrytonNodeFake) {
    this.parentNode = parent;
    this.childNode = child;
  }

  destroy() {}

  reset() {
    this.conditions = [];
  }
}

const PARENT_NAME = 'parent';
const CHILD_NAME = 'child';

describe('EdgeParametersComponent', () => {
  let component: EdgeParametersComponent;
  let fixture: ComponentFixture<EdgeParametersComponent>;
  let loader: HarnessLoader;

  const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close', 'afterClosed']) as Spied<
    MatDialogRef<EdgeParametersComponent>
  >;
  const fakeAfterClosed$ = new Subject<void>();

  // Now we can fake closing action of dialog.
  dialogRefSpy.afterClosed.and.returnValue(fakeAfterClosed$.asObservable());

  const mockParentStep = new CrytonNodeFake(PARENT_NAME);
  const mockChildStep = new CrytonNodeFake(CHILD_NAME);
  const mockGraphEdge = new CrytonEdgeFake(mockParentStep, mockChildStep);

  const dialogDataSpy = jasmine.createSpyObj('MAT_DIALOG_DATA', [], { edge: mockGraphEdge }) as Spied<{
    edge: StepEdge;
  }>;

  const getFormsCount = (): number => {
    const nativeEl = fixture.nativeElement as HTMLElement;
    return nativeEl.querySelectorAll('.condition-form').length;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateCreatorModule, BrowserAnimationsModule, MatDialogModule],
      declarations: [EdgeParametersComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: dialogDataSpy },
        { provide: AlertService, useValue: alertServiceStub }
      ]
    })
      .overrideComponent(EdgeParametersComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EdgeParametersComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;

    mockGraphEdge.reset();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a single condition form on initialization', () => {
    expect(component.conditions.length).toEqual(1);
    expect(getFormsCount()).toEqual(1);
  });

  it('should add a condition on "Add condition" button click', async () => {
    const addConditionBtn = await loader.getHarness(MatButtonHarness.with({ text: /.*Add condition.*/g }));
    await addConditionBtn.click();
    fixture.detectChanges();

    expect(component.conditions.length).toEqual(2);
    expect(getFormsCount()).toEqual(2);
  });

  it('should not allow condition deletion if there is only 1 condition', async () => {
    const cancelBtn = await loader.getHarness(MatButtonHarness.with({ text: /.*cancel.*/g }));
    const isDisabled = await cancelBtn.isDisabled();

    expect(isDisabled).toBeTrue();
  });

  it('should allow condition deletion if there are more conditions', async () => {
    const randomConditionCount = 1 + Math.round(Math.random() * 9);

    for (let i = 0; i < randomConditionCount; i++) {
      component.addCondition();
    }
    fixture.detectChanges();

    const cancelButtons = await loader.getAllHarnesses(MatButtonHarness.with({ text: /.*cancel.*/g }));

    for (const button of cancelButtons) {
      const isDisabled = await button.isDisabled();
      expect(isDisabled).toBeFalse();
    }
  });

  it('should delete condition on cancel click if there are more conditions', async () => {
    component.addCondition();
    component.conditions.at(0).get('type').setValue('result');
    component.onConditionTypeChange(0, 'result');
    component.conditions.at(1).get('type').setValue('state');
    component.onConditionTypeChange(1, 'state');
    fixture.detectChanges();

    // Click on cancel button next to second condition form
    const button = (await loader.getAllHarnesses(MatButtonHarness.with({ text: 'cancel' })))[1];
    await button.click();

    // Expect that exactly the second condition was removed
    expect(component.conditions.length).toEqual(1);
    expect(component.conditions.at(0).value).toEqual({ type: 'result', valueForm: { selection: 'OK' } });
  });

  it('should display "parent name" -> "child name" dependency', () => {
    const nativeEl = fixture.nativeElement as HTMLElement;
    const nodes = nativeEl.querySelector('.parent-child').querySelectorAll('.step-name');

    expect(nodes[0].innerHTML).toEqual(PARENT_NAME);
    expect(nodes[1].innerHTML).toEqual(CHILD_NAME);
  });

  it('should disable save button if conditions are invalid', async () => {
    const saveBtn = await loader.getHarness(MatButtonHarness.with({ text: /.*Save.*/ }));

    expect(await saveBtn.isDisabled()).toBeTrue();

    // Make first condition valid, but second condition invalid
    component.conditions.at(0).get('type').setValue('state');
    component.onConditionTypeChange(0, 'state');
    component.addCondition();
    fixture.detectChanges();

    expect(await saveBtn.isDisabled()).toBeTrue();
  });

  it('should enable save button if all conditions are valid', async () => {
    const saveBtn = await loader.getHarness(MatButtonHarness.with({ text: /.*Save.*/ }));

    component.conditions.at(0).get('type').setValue('state');
    component.onConditionTypeChange(0, 'state');
    fixture.detectChanges();

    expect(await saveBtn.isDisabled()).toBeFalse();
  });
});
