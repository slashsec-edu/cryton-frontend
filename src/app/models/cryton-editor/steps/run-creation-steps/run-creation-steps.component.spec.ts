import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { RunCreationStepsComponent } from './run-creation-steps.component';

import { workers } from 'src/app/testing/mockdata/workers.mockdata';
import { instances } from 'src/app/testing/mockdata/instances.mockdata';
import { Instance } from '../../../api-responses/instance.interface';
import { Worker } from '../../../api-responses/worker.interface';

import { WorkerInventoriesService } from 'src/app/services/worker-inventories.service';
import { WorkersService } from 'src/app/services/workers.service';
import { TestingService } from 'src/app/testing/services/testing.service';
import { InstanceService } from 'src/app/services/instance.service';
import { RunService } from 'src/app/services/run.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CrytonCounterHarness } from 'src/app/modules/shared/components/cryton-counter/cryton-counter.harness';

describe('RunCreationStepsComponent', () => {
  let component: RunCreationStepsComponent;
  let fixture: ComponentFixture<RunCreationStepsComponent>;
  let loader: HarnessLoader;
  let counterHarness: CrytonCounterHarness;

  const createSubject$ = new Subject<void>();
  const eraseEvent$ = new Subject<void>();

  const instanceServiceStub = new TestingService<Instance>(instances);
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
          { provide: InstanceService, useValue: instanceServiceStub },
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

  it('should display title "CHOOSE INSTANCE" in the first step', () => {
    const title = fixture.debugElement.query(By.css('h2')).nativeElement as HTMLElement;
    expect(title.textContent).toEqual('CHOOSE INSTANCE');
  });

  it('should display 3 instances in the first step table', async () => {
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
    component.instance = instances[0];

    createSubject$.next();
    fixture.detectChanges();

    expect(component.create.emit).toHaveBeenCalled();
  });
});
