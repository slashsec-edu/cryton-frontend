import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';

import { ReportComponent } from './components/report/report.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { RunReportCardComponent } from './components/run-report-card/run-report-card.component';
import { ExecutionReportCardComponent } from './components/execution-report-card/execution-report-card.component';
import { StageReportCardComponent } from './components/stage-report-card/stage-report-card.component';
import { StepReportCardComponent } from './components/step-report-card/step-report-card.component';
import { ReportTimelineHelpComponent } from './components/report-timeline-help/report-timeline-help.component';

@NgModule({
  declarations: [
    ReportComponent,
    TimelineComponent,
    RunReportCardComponent,
    ExecutionReportCardComponent,
    StageReportCardComponent,
    StepReportCardComponent,
    ReportTimelineHelpComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatPaginatorModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    CdkAccordionModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  exports: [ReportComponent, TimelineComponent]
})
export class ReportModule {}
