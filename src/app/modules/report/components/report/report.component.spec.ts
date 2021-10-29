import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RunService } from 'src/app/services/run.service';
import { Spied } from 'src/app/testing/utility/utility-types';

import { ReportComponent } from './report.component';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { of } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { ExecutionReportCardComponent } from '../execution-report-card/execution-report-card.component';
import { RunReportCardComponent } from '../run-report-card/run-report-card.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { StageReportCardComponent } from '../stage-report-card/stage-report-card.component';
import { StepReportCardComponent } from '../step-report-card/step-report-card.component';

describe('ReportComponent', () => {
  let component: ReportComponent;
  let fixture: ComponentFixture<ReportComponent>;

  // Mocks activated route, we are asking for the route ID in the component, stub always returns ID 1.
  const routeStub = jasmine.createSpyObj('ActivatedRoute', [], {
    snapshot: { paramMap: { get: () => 1 } }
  }) as Spied<ActivatedRoute>;

  const routerStub = jasmine.createSpyObj('Router', ['navigate']) as Spied<Router>;

  const runServiceStub = jasmine.createSpyObj('RunService', ['downloadReport', 'fetchReport']) as Spied<RunService>;
  runServiceStub.fetchReport.and.returnValue(of(mockReport));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatPaginatorModule, MatIconModule, MatDividerModule, MatButtonModule, SharedModule],
      declarations: [
        ReportComponent,
        ExecutionReportCardComponent,
        RunReportCardComponent,
        StageReportCardComponent,
        StepReportCardComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: RunService, useValue: runServiceStub },
        { provide: Router, useValue: routerStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
