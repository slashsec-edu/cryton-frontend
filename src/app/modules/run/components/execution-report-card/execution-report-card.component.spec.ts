import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExecutionReportCardComponent } from './execution-report-card.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StageReportCardComponent } from '../stage-report-card/stage-report-card.component';
import { httpClientStub } from 'src/app/testing/stubs/http-client.stub';
import { HttpClient } from '@angular/common/http';
import { AlertService } from 'src/app/services/alert.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { RunModule } from '../../run.module';

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
