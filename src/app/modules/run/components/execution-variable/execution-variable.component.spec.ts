import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutionVariableComponent } from './execution-variable.component';
import { httpClientStub } from 'src/app/testing/stubs/http-client.stub';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { ExecutionVariable } from 'src/app/models/api-responses/execution-variable.interface';
import { MatIconModule } from '@angular/material/icon';

describe('ExecutionVariableComponent', () => {
  let component: ExecutionVariableComponent;
  let fixture: ComponentFixture<ExecutionVariableComponent>;

  const certainityCheck = {
    afterClosed: () => of(true)
  };
  const dialogStub = {
    open: () => certainityCheck
  };
  const mockVariable: ExecutionVariable = {
    url: 'http://localhost:8000/cryton/api/v1/execution_variables/1/',
    id: 1,
    name: 'target',
    value: '127.0.0.1',
    plan_execution: 'http://localhost:8000/cryton/api/v1/plan_executions/1/'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExecutionVariableComponent],
      imports: [SharedModule, MatIconModule],
      providers: [
        { provide: HttpClient, useValue: httpClientStub },
        { provide: MatDialog, useValue: dialogStub },
        { provide: AlertService, useValue: alertServiceStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionVariableComponent);
    component = fixture.componentInstance;
    component.variable = mockVariable;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
