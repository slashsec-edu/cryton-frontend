import { CdkAccordionModule } from '@angular/cdk/accordion';
import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { StepReportCardComponent } from './step-report-card.component';

describe('StepReportCardComponent', () => {
  let component: StepReportCardComponent;
  let fixture: ComponentFixture<StepReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, CdkAccordionModule, MatIconModule, BrowserAnimationsModule, MatDividerModule],
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
