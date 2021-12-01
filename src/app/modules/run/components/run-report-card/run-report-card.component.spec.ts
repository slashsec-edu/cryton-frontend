import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RunReportCardComponent } from './run-report-card.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { httpClientStub } from 'src/app/testing/stubs/http-client.stub';
import { HttpClient } from '@angular/common/http';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { MatDividerModule } from '@angular/material/divider';

describe('RunReportCardComponent', () => {
  let component: RunReportCardComponent;
  let fixture: ComponentFixture<RunReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunReportCardComponent],
      imports: [SharedModule, MatIconModule, MatDividerModule],
      providers: [
        { provide: HttpClient, useValue: httpClientStub },
        { provide: AlertService, useValue: alertServiceStub }
      ]
    })
      .overrideComponent(RunReportCardComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunReportCardComponent);
    component = fixture.componentInstance;
    component.report = mockReport;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
