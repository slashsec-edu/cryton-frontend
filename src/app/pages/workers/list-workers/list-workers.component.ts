import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { Button } from 'src/app/models/cryton-table/interfaces/button.interface';
import { WorkerTableDataSource } from 'src/app/models/data-sources/worker-table.data-source';
import { CertainityCheckComponent } from 'src/app/modules/shared/components/certainity-check/certainity-check.component';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { WorkersService } from 'src/app/services/workers.service';
import { Worker } from 'src/app/models/api-responses/worker.interface';

@Component({
  selector: 'app-list-workers',
  templateUrl: './list-workers.component.html',
  styleUrls: ['./list-workers.component.scss'],
  animations: [renderComponentTrigger]
})
export class ListWorkersComponent implements OnInit {
  @ViewChild(CrytonTableComponent) table: CrytonTableComponent<Worker>;

  dataSource: WorkerTableDataSource;
  buttons: Button<Worker>[];

  constructor(private _workersService: WorkersService, private _dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataSource = new WorkerTableDataSource(this._workersService);
    this.buttons = [{ name: 'delete', icon: 'delete', func: this.deleteWorker }];
  }

  /**
   * Checks if you really want to delete the item, deletes it and updates
   * the table paginator.
   *
   * @param worker Worker to be deleted.
   */
  deleteWorker = (worker: Worker): Observable<string> => {
    const dialogRef = this._dialog.open(CertainityCheckComponent);

    return dialogRef.afterClosed().pipe(
      mergeMap(res => (res ? this._workersService.deleteItem(worker.id) : (of(null) as Observable<string>))),
      tap(res => {
        if (res) {
          this.table.updatePaginator();
        }
      })
    );
  };
}
