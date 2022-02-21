// Modules
import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
// Material
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { OutletComponent } from './components/outlet/outlet.component';
import { PageUnavailableComponent } from './components/page-unavailable/page-unavailable.component';
import { ThemeColorGetterComponent } from './components/theme-color-getter/theme-color-getter.component';
import { PlansCreationStepsComponent } from './models/cryton-editor/steps/plans-creation-steps/plans-creation-steps.component';
import { RunCreationStepsComponent } from './models/cryton-editor/steps/run-creation-steps/run-creation-steps.component';
import { TemplateUploadStepsComponent } from './models/cryton-editor/steps/template-upload-steps/template-upload-steps.component';
import { WorkerCreationStepsComponent } from './models/cryton-editor/steps/worker-creation-steps/worker-creation-steps.component';
import { RunModule } from './modules/run/run.module';
import { SharedModule } from './modules/shared/shared.module';
import { TemplateCreatorModule } from './modules/template-creator/template-creator.module';
import { WorkerModule } from './modules/worker/worker.module';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
// Components
import { PlansDashboardComponent } from './pages/dashboard-page/plans-dashboard/plans-dashboard.component';
import { RunsDashboardComponent } from './pages/dashboard-page/runs-dashboard/runs-dashboard.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ListLogsComponent } from './pages/logs/list-logs/list-logs.component';
import { CreatePlanComponent } from './pages/plans/create-plan/create-plan.component';
import { ListPlansComponent } from './pages/plans/list-plans/list-plans.component';
import { CreateRunComponent } from './pages/runs/create-run/create-run.component';
import { ListRunsComponent } from './pages/runs/list-runs/list-runs.component';
import { ListTemplatesComponent } from './pages/templates/list-templates/list-templates.component';
import { UploadTemplateComponent } from './pages/templates/upload-template/upload-template.component';
import { CreateWorkerComponent } from './pages/workers/create-worker/create-worker.component';
import { ListWorkersComponent } from './pages/workers/list-workers/list-workers.component';
import { PlanYamlComponent } from './pages/yaml/plan-yaml.component';
import { RunYamlPreviewComponent } from './pages/yaml/run-yaml-preview.component';
import { TemplateYamlComponent } from './pages/yaml/template-yaml.component';
import { ExecutionVariableService } from './services/execution-variable.service';
import { PlanService } from './services/plan.service';
// Services
import { RunService } from './services/run.service';
import { TemplateService } from './services/template.service';
import { WorkersService } from './services/workers.service';

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
