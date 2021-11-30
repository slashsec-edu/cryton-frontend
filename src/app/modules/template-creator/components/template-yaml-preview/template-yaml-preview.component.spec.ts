import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateYamlPreviewComponent } from './template-yaml-preview.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Spied } from 'src/app/testing/utility/utility-types';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { basicTemplateDescription } from 'src/app/testing/mockdata/cryton-templates/basic-template';

describe('TemplateYamlPreviewComponent', () => {
  let component: TemplateYamlPreviewComponent;
  let fixture: ComponentFixture<TemplateYamlPreviewComponent>;

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
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Invalid template format.');
  });

  it('should show an error if the template is empty', () => {
    component.templateControl.setValue('');

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Template cannot be empty.');
  });

  it('should show an error if the template name is undefined', () => {
    component.templateControl.setValue(`plan:
      name:`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Empty template name.');
  });

  it('should show an error if the template owner is undefined', () => {
    component.templateControl.setValue(`plan:
      name: a
      owner:`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Empty template owner.');
  });

  it('should show an error if there are no stages in the template', () => {
    component.templateControl.setValue(`plan:
      name: a
      owner: a`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith('No stages defined in template.');
  });

  it('should show an error if the stages are not defined as a sequence', () => {
    component.templateControl.setValue(`plan:
      name: a
      owner: a
      stages: a`);

    component.handleCreate();
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Stages are not defined as a sequence.');
  });

  it(`should show an error if a stage doesn't have a name`, () => {
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
    expect(alertServiceStub.showError).toHaveBeenCalledWith(`Stage with index: 0 doesn't have a name.`);
  });

  it('should show an error if there are multiple stages with the same name', () => {
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
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Multiple stages with name: a');
  });

  it('should show an error if there are no steps in the stage', () => {
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
    expect(alertServiceStub.showError).toHaveBeenCalledWith('No steps defined in stage: b');
  });

  it(`should show an error if the steps aren't defined as a sequence`, () => {
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
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Steps of stage: b are not defined as a sequence.');
  });

  it(`should show an error if a step doesn't have a name`, () => {
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
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Step with index: 0 inside stage: b doesnt have a name.');
  });

  it(`should show an error if there are multiple steps with the same name`, () => {
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
    expect(alertServiceStub.showError).toHaveBeenCalledWith('Multiple steps with name: a');
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
