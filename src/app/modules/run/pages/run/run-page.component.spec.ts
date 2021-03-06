import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { AlertService } from 'src/app/services/alert.service';
import { RunService } from 'src/app/services/run.service';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { Spied } from 'src/app/testing/utility/utility-types';
import { ExecutionReportCardComponent } from '../../components/execution-report-card/execution-report-card.component';
import { RunReportCardComponent } from '../../components/run-report-card/run-report-card.component';
import { StageReportCardComponent } from '../../components/stage-report-card/stage-report-card.component';
import { StepReportCardComponent } from '../../components/step-report-card/step-report-card.component';
import { RunPageComponent } from './run-page.component';

describe('RunPageComponent', () => {
  let component: RunPageComponent;
  let fixture: ComponentFixture<RunPageComponent>;

  // Mocks activated route, we are asking for the route ID in the component, stub always returns ID 1.
  const routeStub = jasmine.createSpyObj('ActivatedRoute', [], {
    snapshot: { paramMap: { get: () => 1 } }
  }) as Spied<ActivatedRoute>;

  const routerStub = jasmine.createSpyObj('Router', ['navigate']) as Spied<Router>;

  const runServiceStub = jasmine.createSpyObj('RunService', ['downloadReport', 'fetchReport']) as Spied<RunService>;
  runServiceStub.fetchReport.and.returnValue(of(mockReport));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatPaginatorModule,
        MatIconModule,
        MatDividerModule,
        MatButtonModule,
        SharedModule,
        MatProgressSpinnerModule
      ],
      declarations: [
        RunPageComponent,
        ExecutionReportCardComponent,
        RunReportCardComponent,
        StageReportCardComponent,
        StepReportCardComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: RunService, useValue: runServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: AlertService, useValue: alertServiceStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RunPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
