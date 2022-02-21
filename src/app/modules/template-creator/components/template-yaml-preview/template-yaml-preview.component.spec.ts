import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertService } from 'src/app/services/alert.service';
import { basicTemplateDescription } from 'src/app/testing/mockdata/cryton-templates/basic-template';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { Spied } from 'src/app/testing/utility/utility-types';
import { InvalidTemplateFormatError } from './errors/invalid-template-format.error';
import { NotASequenceError } from './errors/not-a-sequence.error';
import { NotUniqueNameError } from './errors/not-unique-name.error';
import { UndefinedTemplatePropertyError } from './errors/undefined-template-property.error';
import { TemplateYamlPreviewComponent } from './template-yaml-preview.component';

describe('TemplateYamlPreviewComponent', () => {
  let component: TemplateYamlPreviewComponent;
  let fixture: ComponentFixture<TemplateYamlPreviewComponent>;

  const invalidFormatMsg = new InvalidTemplateFormatError().message;

  const dialogRefStub = jasmine.createSpyObj('MatDiaogRef', ['close']) as Spied<
    MatDialogRef<TemplateYamlPreviewComponent>
  >;

  const dialogData = { template: basicTemplateDescription };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateYamlPreviewComponent],
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: AlertService, useValue: alertServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: dialogData }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateYamlPreviewComponent);
    component = fixture.componentInstance;
    alertServiceStub.showError.calls.reset();
    component.templateYAML = basicTemplateDescription;
    component.templateControl.setValue(basicTemplateDescription);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the value of textarea to the template from the dialog data', () => {
    expect(component.templateControl.value).toBe(basicTemplateDescription);
  });

  it('should show an error if the template is null', () => {
    component.templateControl.setValue(null);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(invalidFormatMsg);
  });

  it('should show an error if the template is empty', () => {
    component.templateControl.setValue('');

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(invalidFormatMsg);
  });

  it('should show an error if the template name is undefined', () => {
    const undefinedPropertyMsg = new UndefinedTemplatePropertyError('name').message;
    component.templateControl.setValue(`plan:
      name:`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(undefinedPropertyMsg);
  });

  it('should show an error if the template owner is undefined', () => {
    const undefinedPropertyMsg = new UndefinedTemplatePropertyError('owner').message;
    component.templateControl.setValue(`plan:
      name: a
      owner:`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(undefinedPropertyMsg);
  });

  it('should show an error if there are no stages in the template', () => {
    const undefinedPropertyMsg = new UndefinedTemplatePropertyError('stages').message;
    component.templateControl.setValue(`plan:
      name: a
      owner: a`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(undefinedPropertyMsg);
  });

  it('should show an error if the stages are not defined as a sequence', () => {
    const notASequenceMsg = new NotASequenceError('stages').message;
    component.templateControl.setValue(`plan:
      name: a
      owner: a
      stages: a`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(notASequenceMsg);
  });

  it(`should show an error if a stage doesn't have a name`, () => {
    const undefinedPropertyMsg = new UndefinedTemplatePropertyError('name of stage at index: 0').message;
    component.templateControl.setValue(`plan:
      name: a
      owner: a
      stages:
        - trigger_type: delta
          trigger_args:
            hours: 1
            minutes: 20
            seconds: 20`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(undefinedPropertyMsg);
  });

  it('should show an error if there are multiple stages with the same name', () => {
    const notUniqueNameMsg = new NotUniqueNameError('a').message;
    component.templateControl.setValue(`plan:
      name: a
      owner: a
      stages: 
        - name: a
          trigger_type: delta
          trigger_args:
            hours: 1
            minutes: 20
            seconds: 20
        - name: a
          trigger_type: delta
          trigger_args:
            hours: 2
            minutes: 20
            seconds: 20`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(notUniqueNameMsg);
  });

  it('should show an error if there are no steps in the stage', () => {
    const undefinedPropertyMsg = new UndefinedTemplatePropertyError('steps in stage: b').message;
    component.templateControl.setValue(`plan:
      name: a
      owner: a
      stages:
        - name: b
          trigger_type: delta
          trigger_args:
            hours: 1
            minutes: 20
            seconds: 20`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(undefinedPropertyMsg);
  });

  it(`should show an error if the steps aren't defined as a sequence`, () => {
    const notASequenceMsg = new NotASequenceError('steps of stage: b').message;
    component.templateControl.setValue(`plan:
      name: a
      owner: a
      stages:
        - name: b
          trigger_type: delta
          trigger_args:
            hours: 1
            minutes: 20
            seconds: 20
          steps: a`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(notASequenceMsg);
  });

  it(`should show an error if a step doesn't have a name`, () => {
    const undefinedPropertyMsg = new UndefinedTemplatePropertyError('name of step at index: 0 inside stage: b').message;
    component.templateControl.setValue(`plan:
      name: a
      owner: a
      stages:
        - name: b
          trigger_type: delta
          trigger_args:
            hours: 1
            minutes: 20
            seconds: 20
          steps:
            - attack_module: a
              attack_module_args: a`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(undefinedPropertyMsg);
  });

  it(`should show an error if there are multiple steps with the same name`, () => {
    const notUniqueNameMsg = new NotUniqueNameError('a').message;
    component.templateControl.setValue(`plan:
      name: a
      owner: a
      stages:
        - name: b
          trigger_type: delta
          trigger_args:
            hours: 1
            minutes: 20
            seconds: 20
          steps:
            - name: a
              attack_module: a
              attack_module_args: a
            - name: a
              attack_module: b
              attack_module_args: b`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith(notUniqueNameMsg);
  });

  it('should close with edited template value on create', () => {
    const editedStage = `plan:
      name: a
      owner: a
      stages:
        - name: b
          trigger_type: delta
          trigger_args:
            hours: 1
            minutes: 20
            seconds: 20
          steps:
            - name: a
              attack_module: a
              attack_module_args: a`;
    component.templateControl.setValue(editedStage);

    component.handleCreate();
    expect(dialogRefStub.close).toHaveBeenCalledWith(editedStage);
  });

  it('should close with the initial template value on create', () => {
    component.handleCreate();
    expect(dialogRefStub.close).toHaveBeenCalledWith(basicTemplateDescription);
  });
});
