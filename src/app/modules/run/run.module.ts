import { CdkAccordionModule } from '@angular/cdk/accordion';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { SharedModule } from '../shared/shared.module';
import { WorkerModule } from '../worker/worker.module';
import { ExecutionReportCardComponent } from './components/execution-report-card/execution-report-card.component';
import { ExecutionVariablePreviewComponent } from './components/execution-variable-preview/execution-variable-preview.component';
import { ExecutionVariableUploaderComponent } from './components/execution-variable-uploader/execution-variable-uploader.component';
import { ExecutionVariableComponent } from './components/execution-variable/execution-variable.component';
import { PostponeRunComponent } from './components/postpone-run/postpone-run.component';
import { ReportTimelineHelpComponent } from './components/report-timeline-help/report-timeline-help.component';
import { RunReportCardComponent } from './components/run-report-card/run-report-card.component';
import { StageReportCardComponent } from './components/stage-report-card/stage-report-card.component';
import { StepReportCardComponent } from './components/step-report-card/step-report-card.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { RunPageComponent } from './pages/run/run-page.component';

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
    PostponeRunComponent,
    ExecutionVariablePreviewComponent
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
