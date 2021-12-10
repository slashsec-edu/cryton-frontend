import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutionVariableUploaderComponent } from './execution-variable-uploader.component';
import { httpClientStub } from 'src/app/testing/stubs/http-client.stub';
import { HttpClient } from '@angular/common/http';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';

describe('ExecutionVariableUploaderComponent', () => {
  let component: ExecutionVariableUploaderComponent;
  let fixture: ComponentFixture<ExecutionVariableUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExecutionVariableUploaderComponent],
      providers: [
        { provide: HttpClient, useValue: httpClientStub },
        { provide: AlertService, useValue: alertServiceStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionVariableUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
