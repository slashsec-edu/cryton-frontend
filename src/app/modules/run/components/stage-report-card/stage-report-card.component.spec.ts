import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { StageReportCardComponent } from './stage-report-card.component';

describe('StageReportCardComponent', () => {
  let component: StageReportCardComponent;
  let fixture: ComponentFixture<StageReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, MatIconModule],
      declarations: [StageReportCardComponent]
    })
      .overrideComponent(StageReportCardComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StageReportCardComponent);

    component = fixture.componentInstance;
    component.stage = mockReport.plan_executions[0].stage_executions[0];

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
