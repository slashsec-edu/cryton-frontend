import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../shared/shared.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { WorkerModule } from '../worker/worker.module';
import { ExecutionVariableComponent } from './components/execution-variable/execution-variable.component';
import { ExecutionVariableUploaderComponent } from './components/execution-variable-uploader/execution-variable-uploader.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RunPageComponent } from './pages/run/run-page.component';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { ExecutionReportCardComponent } from './components/execution-report-card/execution-report-card.component';
import { StageReportCardComponent } from './components/stage-report-card/stage-report-card.component';
import { ReportTimelineHelpComponent } from './components/report-timeline-help/report-timeline-help.component';
import { RunReportCardComponent } from './components/run-report-card/run-report-card.component';
import { StepReportCardComponent } from './components/step-report-card/step-report-card.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { PostponeRunComponent } from './components/postpone-run/postpone-run.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ExecutionVariableComponent,
    ExecutionVariableUploaderComponent,
    RunPageComponent,
    ExecutionReportCardComponent,
    StageReportCardComponent,
    ReportTimelineHelpComponent,
    RunReportCardComponent,
    StepReportCardComponent,
    TimelineComponent,
    PostponeRunComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    SharedModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    WorkerModule,
    AppRoutingModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    CdkAccordionModule,
    MatDialogModule,
    MatTooltipModule,
    BrowserAnimationsModule,
    NoopAnimationsModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  exports: [TimelineComponent]
})
export class RunModule {}
