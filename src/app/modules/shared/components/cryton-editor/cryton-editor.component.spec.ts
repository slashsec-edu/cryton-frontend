import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { WorkerCreationStepsComponent } from 'src/app/models/cryton-editor/steps/worker-creation-steps/worker-creation-steps.component';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { AlertService } from 'src/app/services/alert.service';
import { findAsync } from 'src/app/testing/utility/async-find';
import { CrytonButtonHarness } from '../cryton-button/cryton-button.harness';
import { CrytonEditorComponent } from './cryton-editor.component';

describe('CrytonEditorComponent', () => {
  let component: CrytonEditorComponent;
  let fixture: ComponentFixture<CrytonEditorComponent>;
  let loader: HarnessLoader;
  let buttons: CrytonButtonHarness[];

  const matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['openFromComponent']) as MatSnackBar;
  const alertServiceSpy = jasmine.createSpyObj('alertService', [
    'showError',
    'showSuccess',
    'showWarning'
  ]) as AlertService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [CrytonEditorComponent, ComponentInputDirective],
        imports: [
          HttpClientModule,
          BrowserAnimationsModule,
          SharedModule,
          FormsModule,
          ReactiveFormsModule,
          MatInputModule,
          MatFormFieldModule
        ],
        providers: [
          { MatSnackBar, useValue: matSnackBarSpy },
          { provide: AlertService, useValue: alertServiceSpy }
        ]
      })
        .overrideComponent(CrytonEditorComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(async () => {
    fixture = TestBed.createComponent(CrytonEditorComponent);
    loader = TestbedHarnessEnvironment.loader(fixture);

    component = fixture.componentInstance;
    component.stepCount = 1;
    component.itemName = 'Worker';
    component.stepOverviewItems = [{ name: 'Creation Progress', type: StepType.COMPLETION, required: true }];
    component.stepsComponent = WorkerCreationStepsComponent;

    buttons = await loader.getAllHarnesses(CrytonButtonHarness);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be impossible to create a worker with unfinished step', async () => {
    spyOn(component, 'triggerError');
    const progressCell = fixture.debugElement.query(By.css('.overview-item--data')).nativeElement as HTMLElement;
    const createBtn = await findAsync(buttons, async button => button.getIcon().then(icon => icon === 'add_circle'));

    expect(progressCell.textContent).toContain('Incomplete');

    await createBtn.click();
    fixture.detectChanges();

    expect(component.triggerError).toHaveBeenCalled();
  });

  it('should swap creation progress to complete on step completion', () => {
    const progressCell = fixture.debugElement.query(By.css('.overview-item--data')).nativeElement as HTMLElement;

    component.stepOverviewData[0].next(true);
    fixture.detectChanges();

    expect(progressCell.textContent).toContain('Complete');
  });

  it('should display a loading spinner', () => {
    component.creatingSubject$.next(true);
    fixture.detectChanges();

    const loading = fixture.debugElement.query(By.css('.creating'));
    expect(loading).toBeTruthy();
  });

  it('should display loading and emit creation event on triggerCreation call', () => {
    spyOn(component.createSubject$, 'next');
    component.stepOverviewData[0].next(true);
    component.triggerCreation();

    expect(component.creatingSubject$.value).toEqual(true);
    expect(component.createSubject$.next).toHaveBeenCalled();
  });

  it('should correctly complete creation', () => {
    spyOn(component, 'eraseProgress');
    spyOn(component.create, 'emit');
    component.completeCreation(of('success'));

    expect(component.creatingSubject$.value).toEqual(false);
    expect(component.eraseProgress).toHaveBeenCalled();
    expect(component.create.emit).toHaveBeenCalled();
  });

  it('should create steps component', () => {
    const steps = fixture.debugElement.query(By.css('.steps-component'));
    expect(steps).toBeTruthy();
  });

  it('should emit erase event on erase button click', () => {
    spyOn(component.eraseSubject$, 'next');

    const eraseButton = fixture.debugElement.query(By.css('header')).query(By.css('button'))
      .nativeElement as HTMLElement;
    eraseButton.click();
    fixture.detectChanges();

    expect(component.eraseSubject$.next).toHaveBeenCalled();
  });
});
