import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { AlertService } from 'src/app/services/alert.service';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { httpClientStub } from 'src/app/testing/stubs/http-client.stub';
import { RunModule } from '../../run.module';
import { StageReportCardComponent } from '../stage-report-card/stage-report-card.component';
import { ExecutionReportCardComponent } from './execution-report-card.component';

describe('ExecutionReportCardComponent', () => {
  let component: ExecutionReportCardComponent;
  let fixture: ComponentFixture<ExecutionReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExecutionReportCardComponent, StageReportCardComponent],
      imports: [SharedModule, MatIconModule, RunModule],
      providers: [
        { provide: HttpClient, useValue: httpClientStub },
        { provide: AlertService, useValue: alertServiceStub }
      ]
    })
      .overrideComponent(ExecutionReportCardComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionReportCardComponent);

    component = fixture.componentInstance;
    component.execution = mockReport.plan_executions[0];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
