// MODULES
import { PortalModule } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
// MATERIAL
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { SharedModule } from '../shared/shared.module';
import { DateTimeTriggerParametersComponent } from './components/date-time-trigger-parameters/date-time-trigger-parameters.component';
import { DeltaTriggerParametersComponent } from './components/delta-trigger-parameters/delta-trigger-parameters.component';
import { DependencyGraphEditorComponent } from './components/dependency-graph-editor/dependency-graph-editor.component';
import { EdgeParametersComponent } from './components/edge-parameters/edge-parameters.component';
import { GraphEditorToolbarComponent } from './components/graph-editor-toolbar/graph-editor-toolbar.component';
import { GraphNodeDispenserComponent } from './components/graph-node-dispenser/graph-node-dispenser.component';
import { HttpTriggerParametersComponent } from './components/http-trigger-parameters/http-trigger-parameters.component';
import { StageCreatorComponent } from './components/stage-creator/stage-creator.component';
import { StageParametersComponent } from './components/stage-parameters/stage-parameters.component';
// COMPONENTS
import { StepCreatorComponent } from './components/step-creator/step-creator.component';
import { TemplateYamlPreviewComponent } from './components/template-yaml-preview/template-yaml-preview.component';
import { TimelineNodeParametersComponent } from './components/timeline-node-parameters/timeline-node-parameters.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { CreateStagePageComponent } from './pages/creation-steps/create-stage-page/create-stage-page.component';
import { CreateStepPageComponent } from './pages/creation-steps/create-step-page/create-step-page.component';
import { CreateTemplatePageComponent } from './pages/creation-steps/create-template-page/create-template-page.component';
import { TemplateCreatorIntroductionComponent } from './pages/creation-steps/introduction-page/introduction-page.component';
import { DependencyGraphHelpComponent } from './pages/help-pages/dependency-graph-help/dependency-graph-help.component';
import { StageCreatorHelpComponent } from './pages/help-pages/stage-creator-help/stage-creator-help.component';
import { StepCreatorHelpComponent } from './pages/help-pages/step-creator-help/step-creator-help.component';
import { TemplateCreatorHelpComponent } from './pages/help-pages/template-creator-help/template-creator-help.component';
import { TemplateTimelineHelpComponent } from './pages/help-pages/template-timeline-help/template-timeline-help.component';
import { TemplateCreatorPageComponent } from './pages/template-creator-page/template-creator-page.component';

@NgModule({
  declarations: [
    StepCreatorComponent,
    GraphNodeDispenserComponent,
    DependencyGraphEditorComponent,
    StageCreatorComponent,
    EdgeParametersComponent,
    CreateTemplatePageComponent,
    TimelineComponent,
    TimelineNodeParametersComponent,
    StageParametersComponent,
    GraphEditorToolbarComponent,
    DeltaTriggerParametersComponent,
    HttpTriggerParametersComponent,
    TemplateTimelineHelpComponent,
    StepCreatorHelpComponent,
    StageCreatorHelpComponent,
    TemplateCreatorHelpComponent,
    DependencyGraphHelpComponent,
    TemplateCreatorPageComponent,
    TemplateCreatorIntroductionComponent,
    CreateStagePageComponent,
    CreateStepPageComponent,
    TemplateYamlPreviewComponent,
    DateTimeTriggerParametersComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatTabsModule,
    MatDividerModule,
    PortalModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    NgxMatSelectSearchModule
  ]
})
export class TemplateCreatorModule {}
