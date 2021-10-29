import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionReportCardComponent } from './execution-report-card.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StageReportCardComponent } from '../stage-report-card/stage-report-card.component';

describe('ExecutionReportCardComponent', () => {
  let component: ExecutionReportCardComponent;
  let fixture: ComponentFixture<ExecutionReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, MatIconModule],
      declarations: [ExecutionReportCardComponent, StageReportCardComponent]
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
