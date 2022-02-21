import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { RunService } from 'src/app/services/run.service';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { Spied } from 'src/app/testing/utility/utility-types';
import { TimelineComponent } from './timeline.component';

describe('TimelineComponent', () => {
  let component: TimelineComponent;
  let fixture: ComponentFixture<TimelineComponent>;

  // Mocks activated route, we are asking for the route ID in the component, stub always returns ID 1.
  const routeStub = jasmine.createSpyObj('ActivatedRoute', [], {
    snapshot: { paramMap: { get: () => 1 } }
  }) as Spied<ActivatedRoute>;

  // Stub run service, returns mock report from fetchReport method. Ignores the run ID.
  const runServiceStub = jasmine.createSpyObj('RunService', ['fetchReport']) as Spied<RunService>;
  runServiceStub.fetchReport.and.returnValue(of(mockReport));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule,
        BrowserAnimationsModule,
        MatProgressSpinnerModule,
        MatPaginatorModule,
        MatIconModule,
        MatButtonModule
      ],
      declarations: [TimelineComponent],
      providers: [
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: RunService, useValue: runServiceStub }
      ]
    })
      .overrideComponent(TimelineComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
