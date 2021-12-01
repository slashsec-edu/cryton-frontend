import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Button } from 'src/app/models/cryton-table/interfaces/button.interface';
import { InstanceTableDataSource } from 'src/app/models/data-sources/instance-table.data-source';
import { Instance } from 'src/app/models/api-responses/instance.interface';
import { CertainityCheckComponent } from 'src/app/modules/shared/components/certainity-check/certainity-check.component';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { InstanceService } from 'src/app/services/instance.service';

@Component({
  selector: 'app-list-instances',
  templateUrl: './list-instances.component.html',
  styleUrls: ['./list-instances.component.scss']
})
export class ListInstancesComponent implements OnInit {
  @ViewChild(CrytonTableComponent) table: CrytonTableComponent<Instance>;

  dataSource: InstanceTableDataSource;
  buttons: Button<Instance>[];
  filesToUpload: FileList;

  constructor(
    private _instanceService: InstanceService,
    private _dialog: MatDialog,
    private _datePipe: CrytonDatetimePipe
  ) {}

  ngOnInit(): void {
    this.dataSource = new InstanceTableDataSource(this._instanceService, this._datePipe);
    this.buttons = [{ icon: 'delete', func: this.deleteInstance }];
  }

  /**
   * Checks if you really want to delete the item, deletes it and updates
   * the table paginator.
   *
   * @param instance Instance to be deleted.
   */
  deleteInstance = (instance: Instance): Observable<string> => {
    const dialogRef = this._dialog.open(CertainityCheckComponent);

    return dialogRef.afterClosed().pipe(
      mergeMap(res => (res ? this._instanceService.deleteItem(instance.id) : (of(null) as Observable<string>))),
      tap(res => {
        if (res) {
          this.table.updatePaginator();
        }
      })
    );
  };
}
