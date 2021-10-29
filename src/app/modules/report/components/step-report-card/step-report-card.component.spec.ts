import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StepReportCardComponent } from './step-report-card.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { MatIconModule } from '@angular/material/icon';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { ChangeDetectionStrategy } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('StepReportCardComponent', () => {
  let component: StepReportCardComponent;
  let fixture: ComponentFixture<StepReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, CdkAccordionModule, MatIconModule, BrowserAnimationsModule],
      declarations: [StepReportCardComponent]
    })
      .overrideComponent(StepReportCardComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StepReportCardComponent);

    component = fixture.componentInstance;
    component.step = mockReport.plan_executions[0].stage_executions[0].step_executions[0];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
