// MODULES
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PortalModule } from '@angular/cdk/portal';

// MATERIAL
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// COMPONENTS
import { TemplateCreatorComponent } from './components/template-creator/template-creator.component';
import { StepCreatorComponent } from './components/step-creator/step-creator.component';
import { TreeNodeDispenserComponent } from './components/tree-node-dispenser/tree-node-dispenser.component';
import { DependencyTreeEditorComponent } from './components/dependency-tree-editor/dependency-tree-editor.component';
import { StageCreatorComponent } from './components/stage-creator/stage-creator.component';
import { CreateStagePageComponent } from './pages/create-stage-page/create-stage-page.component';
import { EdgeParametersComponent } from './components/edge-parameters/edge-parameters.component';
import { BuildTemplatePageComponent } from './pages/build-template-page/build-template-page.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { TimelineNodeParametersComponent } from './components/timeline-node-parameters/timeline-node-parameters.component';
import { StageParametersComponent } from './components/stage-parameters/stage-parameters.component';
import { TreeEditorToolbarComponent } from './components/tree-editor-toolbar/tree-editor-toolbar.component';
import { DeltaTriggerParametersComponent } from './components/delta-trigger-parameters/delta-trigger-parameters.component';
import { HttpTriggerParametersComponent } from './components/http-trigger-parameters/http-trigger-parameters.component';
import { TemplateTimelineHelpComponent } from './components/template-timeline-help/template-timeline-help.component';
import { StepCreatorHelpComponent } from './components/step-creator-help/step-creator-help.component';
import { StageCreatorHelpComponent } from './components/stage-creator-help/stage-creator-help.component';
import { TemplateCreatorHelpComponent } from './components/template-creator-help/template-creator-help.component';
import { DependencyTreeHelpComponent } from './components/dependency-tree-help/dependency-tree-help.component';

@NgModule({
  declarations: [
    TemplateCreatorComponent,
    StepCreatorComponent,
    TreeNodeDispenserComponent,
    DependencyTreeEditorComponent,
    StageCreatorComponent,
    CreateStagePageComponent,
    EdgeParametersComponent,
    BuildTemplatePageComponent,
    TimelineComponent,
    TimelineNodeParametersComponent,
    StageParametersComponent,
    TreeEditorToolbarComponent,
    DeltaTriggerParametersComponent,
    HttpTriggerParametersComponent,
    TemplateTimelineHelpComponent,
    StepCreatorHelpComponent,
    StageCreatorHelpComponent,
    TemplateCreatorHelpComponent,
    DependencyTreeHelpComponent
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
    MatProgressSpinnerModule
  ],
  exports: [TemplateCreatorComponent]
})
export class TemplateCreatorModule {}
