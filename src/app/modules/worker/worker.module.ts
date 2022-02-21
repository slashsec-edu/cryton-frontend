import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from '../shared/shared.module';
import { WorkerTableComponent } from './components/worker-table/worker-table.component';
import { WorkersListComponent } from './components/workers-list/workers-list.component';

@NgModule({
  declarations: [WorkerTableComponent, WorkersListComponent],
  imports: [
    CommonModule,
    SharedModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatButtonModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  exports: [WorkersListComponent]
})
export class WorkerModule {}
