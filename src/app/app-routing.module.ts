import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';
import { PageUnavailableComponent } from './components/page-unavailable/page-unavailable.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { ListTemplatesComponent } from './pages/templates/list-templates/list-templates.component';
import { OutletComponent } from './components/outlet/outlet.component';
import { CreateTemplateComponent } from './pages/templates/create-template/create-template.component';
import { ListInstancesComponent } from './pages/instances/list-instances/list-instances.component';
import { CreateInstanceComponent } from './pages/instances/create-instance/create-instance.component';
import { ListWorkersComponent } from './pages/workers/list-workers/list-workers.component';
import { CreateWorkerComponent } from './pages/workers/create-worker/create-worker.component';
import { ListRunsComponent } from './pages/runs/list-runs/list-runs.component';
import { CreateRunComponent } from './pages/runs/create-run/create-run.component';
import { UploadTemplateComponent } from './pages/templates/upload-template/upload-template.component';
import { ListLogsComponent } from './pages/logs/list-logs/list-logs.component';
import { RunPageComponent } from './modules/run/pages/run/run-page.component';
import { TimelineComponent } from './modules/run/components/timeline/timeline.component';

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
        path: 'workers',
        component: OutletComponent,
        children: [
          { path: 'list', component: ListWorkersComponent },
          { path: 'create', component: CreateWorkerComponent },
          { path: '', redirectTo: '/app/workers/list', pathMatch: 'full' }
        ]
      },
      {
        path: 'instances',
        component: OutletComponent,
        children: [
          { path: 'list', component: ListInstancesComponent },
          { path: 'create', component: CreateInstanceComponent },
          {
            path: '',
            redirectTo: '/app/instances/list',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'templates',
        component: OutletComponent,
        children: [
          { path: 'list', component: ListTemplatesComponent },
          { path: 'create', component: CreateTemplateComponent },
          { path: 'create/:id', component: CreateTemplateComponent },
          { path: 'upload', component: UploadTemplateComponent },
          { path: '', redirectTo: '/app/templates/list', pathMatch: 'full' }
        ]
      },
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
