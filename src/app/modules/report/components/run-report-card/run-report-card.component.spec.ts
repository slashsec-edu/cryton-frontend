import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunReportCardComponent } from './run-report-card.component';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { mockReport } from 'src/app/testing/mockdata/report.mockdata';
import { ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

describe('RunReportCardComponent', () => {
  let component: RunReportCardComponent;
  let fixture: ComponentFixture<RunReportCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunReportCardComponent],
      imports: [SharedModule, MatIconModule]
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
