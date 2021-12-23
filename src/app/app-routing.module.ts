import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { PageUnavailableComponent } from './components/page-unavailable/page-unavailable.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ListTemplatesComponent } from './pages/templates/list-templates/list-templates.component';
import { OutletComponent } from './components/outlet/outlet.component';
import { ListPlansComponent } from './pages/plans/list-plans/list-plans.component';
import { ListWorkersComponent } from './pages/workers/list-workers/list-workers.component';
import { CreateWorkerComponent } from './pages/workers/create-worker/create-worker.component';
import { ListRunsComponent } from './pages/runs/list-runs/list-runs.component';
import { CreateRunComponent } from './pages/runs/create-run/create-run.component';
import { UploadTemplateComponent } from './pages/templates/upload-template/upload-template.component';
import { ListLogsComponent } from './pages/logs/list-logs/list-logs.component';
import { RunPageComponent } from './modules/run/pages/run/run-page.component';
import { TimelineComponent } from './modules/run/components/timeline/timeline.component';
import { RunYamlPreviewComponent } from './pages/yaml/run-yaml-preview.component';
import { CreatePlanComponent } from './pages/plans/create-plan/create-plan.component';
import { PlanYamlComponent } from './pages/yaml/plan-yaml.component';
import { TemplateYamlComponent } from './pages/yaml/template-yaml.component';
import { TemplateCreatorPageComponent } from './modules/template-creator/pages/template-creator-page/template-creator-page.component';

const routes: Routes = [
  {
    path: 'app',
    component: NavigationComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardPageComponent
      },
      {
        path: 'runs',
        component: OutletComponent,
        children: [
          { path: 'list', component: ListRunsComponent },
          { path: 'create', component: CreateRunComponent },
          { path: '', redirectTo: '/app/runs/list', pathMatch: 'full' }
        ]
      },
      {
        path: 'runs/:id',
        component: RunPageComponent
      },
      {
        path: 'runs/:id/timeline',
        component: TimelineComponent
      },
      {
        path: 'runs/:id/yaml',
        component: RunYamlPreviewComponent
      },
      {
        path: 'workers',
        component: OutletComponent,
        children: [
          { path: 'list', component: ListWorkersComponent },
          { path: 'create', component: CreateWorkerComponent },
          { path: '', redirectTo: '/app/workers/list', pathMatch: 'full' }
        ]
      },
      {
        path: 'plans',
        component: OutletComponent,
        children: [
          { path: 'list', component: ListPlansComponent },
          { path: 'create', component: CreatePlanComponent },
          {
            path: '',
            redirectTo: '/app/plans/list',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'plans/:id/yaml',
        component: PlanYamlComponent
      },
      {
        path: 'templates',
        component: OutletComponent,
        children: [
          { path: 'list', component: ListTemplatesComponent },
          { path: 'create', component: TemplateCreatorPageComponent },
          { path: 'upload', component: UploadTemplateComponent },
          { path: '', redirectTo: '/app/templates/list', pathMatch: 'full' }
        ]
      },
      { path: 'templates/:id/yaml', component: TemplateYamlComponent },
      { path: 'logs', component: ListLogsComponent },
      { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },
      { path: '**', component: PageUnavailableComponent }
    ]
  },
  { path: 'login', component: LoginPageComponent },
  { path: '', redirectTo: '/app/dashboard', pathMatch: 'full' },
  { path: '**', component: PageUnavailableComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
