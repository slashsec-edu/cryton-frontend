import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpForm, HttpTriggerForm } from '../../classes/stage-creation/forms/http-form';

import { HttpTriggerParametersComponent } from './http-trigger-parameters.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

describe('HttpTriggerParametersComponent', () => {
  let component: HttpTriggerParametersComponent;
  let fixture: ComponentFixture<HttpTriggerParametersComponent>;

  let nativeEl: HTMLElement;
  let testTriggerForm: HttpForm;
  let triggerArgsForm: HttpTriggerForm;

  const getCancelBtn = (formElement: 'route' | 'parameter'): HTMLButtonElement => {
    const route = nativeEl.querySelector(`.${formElement}`);
    return route.querySelector('button');
  };

  const getAllRoutes = (): HTMLElement[] => Array.from(nativeEl.querySelectorAll('.route'));
  const getAllParameters = (): HTMLElement[] => Array.from(nativeEl.querySelectorAll('.parameter'));
  const getAddRouteBtn = (): HTMLButtonElement => nativeEl.querySelector('#add-route');
  const getAddParameterBtn = (route: HTMLElement): HTMLButtonElement => route.querySelector('.add-parameter');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatIconModule
      ],
      declarations: [HttpTriggerParametersComponent]
    })
      .overrideComponent(HttpTriggerParametersComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HttpTriggerParametersComponent);

    component = fixture.componentInstance;
    nativeEl = fixture.nativeElement as HTMLElement;
    testTriggerForm = new HttpForm();
    triggerArgsForm = testTriggerForm.getArgsForm();
    component.triggerForm = testTriggerForm;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 1 route with 1 parameter by default', () => {
    const routes = getAllRoutes();
    const parameters = getAllParameters();

    expect(routes.length).toEqual(1);
    expect(parameters.length).toEqual(1);
  });

  it('should disable "Cancel" button when there is only 1 route', () => {
    const cancelBtn = getCancelBtn('route');
    expect(cancelBtn.disabled).toBeTrue();
  });

  it('should disable "Cancel" button when there is only 1 parameter', () => {
    const cancelBtn = getCancelBtn('parameter');
    expect(cancelBtn.disabled).toBeTrue();
  });

  it('should enable "Cancel" button when there are more routes', () => {
    component.triggerForm.addRoute();
    fixture.detectChanges();

    const cancelBtn = getCancelBtn('route');
    expect(cancelBtn.disabled).toBeFalse();
  });

  it('should enable "Cancel" button when there are more parameters', () => {
    component.triggerForm.addParameter(triggerArgsForm.routes[0]);
    fixture.detectChanges();

    const cancelBtn = getCancelBtn('parameter');
    expect(cancelBtn.disabled).toBeFalse();
  });

  it('should remove route on "Cancel" button click if there are more routes', () => {
    component.triggerForm.addRoute();
    fixture.detectChanges();

    let routes = getAllRoutes();
    expect(routes.length).toEqual(2);

    const routeCancel = getCancelBtn('route');
    routeCancel.click();
    fixture.detectChanges();

    routes = getAllRoutes();
    expect(routes.length).toEqual(1);
  });

  it('should remove parameter on "Cancel" button click if there are more parameters', () => {
    component.triggerForm.addParameter(triggerArgsForm.routes[0]);
    fixture.detectChanges();

    let params = getAllParameters();
    expect(params.length).toEqual(2);

    const paramCancel = getCancelBtn('parameter');
    paramCancel.click();
    fixture.detectChanges();

    params = getAllParameters();
    expect(params.length).toEqual(1);
  });

  it('should add route on "Add route" button click', () => {
    let routes = getAllRoutes();
    const addRouteBtn = getAddRouteBtn();

    expect(routes.length).toEqual(1);

    addRouteBtn.click();
    fixture.detectChanges();

    routes = getAllRoutes();
    expect(routes.length).toEqual(2);
  });

  it('should add parameter on "Add parameter" button click', () => {
    let params = getAllParameters();
    const route = getAllRoutes()[0];
    const addParamBtn = getAddParameterBtn(route);

    expect(params.length).toEqual(1);

    addParamBtn.click();
    fixture.detectChanges();

    params = getAllParameters();
    expect(params.length).toEqual(2);
  });
});
