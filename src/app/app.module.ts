// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from './modules/shared/shared.module';
import { TemplateCreatorModule } from './modules/template-creator/template-creator.module';
import { CommonModule } from '@angular/common';
import { RunModule } from './modules/run/run.module';
import { WorkerModule } from './modules/worker/worker.module';

// Material
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Services
import { RunService } from './services/run.service';
import { PlanService } from './services/plan.service';
import { WorkersService } from './services/workers.service';
import { TemplateService } from './services/template.service';
import { ExecutionVariableService } from './services/execution-variable.service';

// Components
import { PlansDashboardComponent } from './pages/dashboard-page/plans-dashboard/plans-dashboard.component';
import { AppComponent } from './app.component';
import { RunsDashboardComponent } from './pages/dashboard-page/runs-dashboard/runs-dashboard.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { PageUnavailableComponent } from './components/page-unavailable/page-unavailable.component';
import { RunCreationStepsComponent } from './models/cryton-editor/steps/run-creation-steps/run-creation-steps.component';
import { WorkerCreationStepsComponent } from './models/cryton-editor/steps/worker-creation-steps/worker-creation-steps.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { TemplateUploadStepsComponent } from './models/cryton-editor/steps/template-upload-steps/template-upload-steps.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { PlansCreationStepsComponent } from './models/cryton-editor/steps/plans-creation-steps/plans-creation-steps.component';
import { ListTemplatesComponent } from './pages/templates/list-templates/list-templates.component';
import { OutletComponent } from './components/outlet/outlet.component';
import { ListPlansComponent } from './pages/plans/list-plans/list-plans.component';
import { CreatePlanComponent } from './pages/plans/create-plan/create-plan.component';
import { ListWorkersComponent } from './pages/workers/list-workers/list-workers.component';
import { CreateWorkerComponent } from './pages/workers/create-worker/create-worker.component';
import { ListRunsComponent } from './pages/runs/list-runs/list-runs.component';
import { CreateRunComponent } from './pages/runs/create-run/create-run.component';
import { LayoutModule } from '@angular/cdk/layout';
import { UploadTemplateComponent } from './pages/templates/upload-template/upload-template.component';
import { ThemeColorGetterComponent } from './components/theme-color-getter/theme-color-getter.component';
import { ListLogsComponent } from './pages/logs/list-logs/list-logs.component';
import { PlanYamlComponent } from './pages/yaml/plan-yaml.component';
import { TemplateYamlComponent } from './pages/yaml/template-yaml.component';
import { RunYamlPreviewComponent } from './pages/yaml/run-yaml-preview.component';

@NgModule({
  declarations: [
    AppComponent,
    RunsDashboardComponent,
    PlansDashboardComponent,
    DashboardPageComponent,
    PageUnavailableComponent,
    RunCreationStepsComponent,
    WorkerCreationStepsComponent,
    LoginPageComponent,
    TemplateUploadStepsComponent,
    PlansCreationStepsComponent,
    NavigationComponent,
    ListTemplatesComponent,
    OutletComponent,
    ListPlansComponent,
    CreatePlanComponent,
    ListWorkersComponent,
    CreateWorkerComponent,
    ListRunsComponent,
    CreateRunComponent,
    UploadTemplateComponent,
    ThemeColorGetterComponent,
    ListLogsComponent,
    PlanYamlComponent,
    TemplateYamlComponent,
    RunYamlPreviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NoopAnimationsModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatIconModule,
    FormsModule,
    MatFormFieldModule,
    MatProgressBarModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatSelectModule,
    SharedModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    TemplateCreatorModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    LayoutModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatMenuModule,
    CommonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    RunModule,
    WorkerModule
  ],
  providers: [RunService, PlanService, WorkersService, TemplateService, ExecutionVariableService],
  bootstrap: [AppComponent]
})
export class AppModule {}
