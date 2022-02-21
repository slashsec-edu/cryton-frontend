import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject, Subject } from 'rxjs';
import { WorkersService } from 'src/app/services/workers.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { InputChange } from '../../../cryton-editor/interfaces/input-change.interface';
import { WorkerCreationStepsComponent } from './worker-creation-steps.component';

describe('WorkerCreationStepsComponent', () => {
  let component: WorkerCreationStepsComponent;
  let fixture: ComponentFixture<WorkerCreationStepsComponent>;
  const eraseSubject$ = new Subject<void>();
  const createSubject$ = new Subject<void>();

  const spyService = jasmine.createSpyObj('WorkersService', ['postItem']) as Spied<WorkersService>;

  const fillWorkerForm = (form: FormGroup): void => {
    form.setValue({
      name: 'name',
      ip: 'ip',
      qPrefix: 'qPrefix'
    });
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          HttpClientModule,
          MatFormFieldModule,
          ReactiveFormsModule,
          FormsModule,
          MatInputModule,
          BrowserAnimationsModule
        ],
        declarations: [WorkerCreationStepsComponent],
        providers: [{ provide: WorkersService, useValue: spyService }]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerCreationStepsComponent);
    component = fixture.componentInstance;
    component.createEvent$ = createSubject$.asObservable();
    component.eraseEvent$ = eraseSubject$.asObservable();
    component.currentStepSubject$ = new BehaviorSubject(0);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit incomplete input change when form is incomplete', () => {
    spyOn(component.inputChange, 'emit').and.callFake((event: InputChange) => {
      expect(event.completion).toBeFalse();
    });
    component.handleInput();
  });

  it('should emit complete input change when form is complete', () => {
    spyOn(component.inputChange, 'emit').and.callFake((event: InputChange) => {
      expect(event.completion).toBeTrue();
    });

    fillWorkerForm(component.workerForm);
    component.handleInput();
  });

  it('should reset all inputs on erase event', () => {
    fillWorkerForm(component.workerForm);
    eraseSubject$.next();

    const form = component.workerForm;
    expect(form.get('name').value).toBeFalsy();
    expect(form.get('ip').value).toBeFalsy();
    expect(form.get('qPrefix').value).toBeFalsy();
  });

  it('should create correct POST request body on create event', () => {
    spyOn(component, 'createPostRequest').and.callThrough();

    fillWorkerForm(component.workerForm);

    spyService.postItem.and.callFake((data: Record<string, unknown>) => {
      expect(data['name']).toEqual('name');
      expect(data['address']).toEqual('ip');
      expect(data['q_prefix']).toEqual('qPrefix');
      expect(data['state']).toEqual('DOWN');
    });

    createSubject$.next();
    expect(component.createPostRequest).toHaveBeenCalled();
  });
});
