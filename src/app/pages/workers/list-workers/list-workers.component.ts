import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Worker } from 'src/app/models/api-responses/worker.interface';
import { WorkerTableDataSource } from 'src/app/models/data-sources/worker-table.data-source';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { ActionButton } from 'src/app/modules/shared/components/cryton-table/buttons/action-button';
import { DeleteButton } from 'src/app/modules/shared/components/cryton-table/buttons/delete-button';
import { HealthCheckButton } from 'src/app/modules/shared/components/cryton-table/buttons/healthcheck-button';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { WorkersService } from 'src/app/services/workers.service';

@Component({
  selector: 'app-list-workers',
  templateUrl: './list-workers.component.html',
  styleUrls: ['./list-workers.component.scss'],
  animations: [renderComponentTrigger]
})
export class ListWorkersComponent implements OnInit {
  @ViewChild(CrytonTableComponent) table: CrytonTableComponent<Worker>;

  dataSource: WorkerTableDataSource;
  buttons: ActionButton<Worker>[];

  constructor(private _workersService: WorkersService, private _dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataSource = new WorkerTableDataSource(this._workersService);
    this.buttons = [new HealthCheckButton(this._workersService), new DeleteButton(this._workersService, this._dialog)];
  }
}
