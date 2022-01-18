import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PlansCreationStepsComponent } from './plans-creation-steps.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { templates } from 'src/app/testing/mockdata/templates.mockdata';
import { PlanService } from 'src/app/services/plan.service';
import { TestingService } from 'src/app/testing/services/testing.service';
import { TemplateService } from 'src/app/services/template.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { AlertService } from 'src/app/services/alert.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { CrytonFileUploaderComponent } from 'src/app/modules/shared/components/cryton-file-uploader/cryton-file-uploader.component';
import { MatIconModule } from '@angular/material/icon';

describe('PlansCreationStepsComponent', () => {
  let component: PlansCreationStepsComponent;
  let fixture: ComponentFixture<PlansCreationStepsComponent>;

  const planServiceStub = jasmine.createSpyObj('PlanService', ['postPlan']) as PlanService;
  const templateServiceStub = new TestingService(templates);
  const alertServiceStub = jasmine.createSpyObj('AlertService', [
    'showError',
    'showWarning',
    'showSuccess'
  ]) as AlertService;

  const currentStepSubject$ = new BehaviorSubject(0);
  const eraseEvent$ = new Subject<void>();
  const createEvent$ = new Subject<void>();

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [PlansCreationStepsComponent, CrytonFileUploaderComponent],
        imports: [SharedModule, BrowserAnimationsModule, MatIconModule],
        providers: [
          { provide: PlanService, useValue: planServiceStub },
          { provide: TemplateService, useValue: templateServiceStub },
          { provide: AlertService, useValue: alertServiceStub }
        ]
      })
        .overrideComponent(PlansCreationStepsComponent, {
          set: { changeDetection: ChangeDetectionStrategy.Default }
        })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(PlansCreationStepsComponent);
    component = fixture.componentInstance;
    component.currentStepSubject$ = currentStepSubject$;
    component.eraseEvent$ = eraseEvent$.asObservable();
    component.createEvent$ = createEvent$.asObservable();

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
