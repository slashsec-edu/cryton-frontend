import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerTableComponent } from './components/worker-table/worker-table.component';
import { SharedModule } from '../shared/shared.module';
import { WorkersListComponent } from './components/workers-list/workers-list.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
