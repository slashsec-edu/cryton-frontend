import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject } from 'rxjs';
import { CrytonCounterHarness } from 'src/app/modules/shared/components/cryton-counter/cryton-counter.harness';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { AlertService } from 'src/app/services/alert.service';
import { PlanService } from 'src/app/services/plan.service';
import { RunService } from 'src/app/services/run.service';
import { WorkerInventoriesService } from 'src/app/services/worker-inventories.service';
import { WorkersService } from 'src/app/services/workers.service';
import { plans } from 'src/app/testing/mockdata/plans.mockdata';
import { workers } from 'src/app/testing/mockdata/workers.mockdata';
import { TestingService } from 'src/app/testing/services/testing.service';
import { Plan } from '../../../api-responses/plan.interface';
import { Worker } from '../../../api-responses/worker.interface';
import { RunCreationStepsComponent } from './run-creation-steps.component';

describe('RunCreationStepsComponent', () => {
  let component: RunCreationStepsComponent;
  let fixture: ComponentFixture<RunCreationStepsComponent>;
  let loader: HarnessLoader;
  let counterHarness: CrytonCounterHarness;

  const createSubject$ = new Subject<void>();
  const eraseEvent$ = new Subject<void>();

  const planServiceStub = new TestingService<Plan>(plans);
  const workersServiceStub = new TestingService<Worker>(workers);
  const runServiceStub = jasmine.createSpyObj('RunService', ['postRun']) as RunService;
  const alertServiceStub = jasmine.createSpyObj('AlertService', [
    'showError',
    'showSuccess',
    'showWarning'
  ]) as AlertService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule, SharedModule],
        declarations: [RunCreationStepsComponent],
        providers: [
          { provide: PlanService, useValue: planServiceStub },
          { provide: WorkersService, useValue: workersServiceStub },
          { provide: RunService, useValue: runServiceStub },
          { provide: WorkerInventoriesService, useValue: workersServiceStub },
          { provide: AlertService, useValue: alertServiceStub }
        ]
      })
        .overrideComponent(RunCreationStepsComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(RunCreationStepsComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);
    component = fixture.componentInstance;
    component.createEvent$ = createSubject$.asObservable();
    component.eraseEvent$ = eraseEvent$.asObservable();
    component.currentStepSubject$ = new BehaviorSubject(0);

    counterHarness = await loader.getHarness(CrytonCounterHarness);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title "Choose plan" in the first step', () => {
    const title = fixture.debugElement.query(By.css('h2')).nativeElement as HTMLElement;
    expect(title.textContent).toEqual('Choose plan');
  });

  it('should display 3 plans in the first step table', async () => {
    const count = await counterHarness.getCount();
    expect(count).toEqual(3);
  });

  it('should display second step if current step subject emits 1', () => {
    component.currentStepSubject$.next(1);
    fixture.detectChanges();
    expect(component.isHidden(1)).toEqual(false);
  });

  it('should create POST request body on create event', () => {
    spyOn(component.create, 'emit');

    component.workers = workers;
    component.plan = plans[0];

    createSubject$.next();
    fixture.detectChanges();

    expect(component.create.emit).toHaveBeenCalled();
  });
});
