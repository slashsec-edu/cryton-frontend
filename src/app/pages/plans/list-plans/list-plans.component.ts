import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { Button } from 'src/app/models/cryton-table/interfaces/button.interface';
import { PlanTableDataSource } from 'src/app/models/data-sources/plan-table.data-source';
import { Plan } from 'src/app/models/api-responses/plan.interface';
import { CertainityCheckComponent } from 'src/app/modules/shared/components/certainity-check/certainity-check.component';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { PlanService } from 'src/app/services/plan.service';

@Component({
  selector: 'app-list-plans',
  templateUrl: './list-plans.component.html',
  styleUrls: ['./list-plans.component.scss']
})
export class ListPlansComponent implements OnInit {
  @ViewChild(CrytonTableComponent) table: CrytonTableComponent<Plan>;

  dataSource: PlanTableDataSource;
  buttons: Button<Plan>[];
  filesToUpload: FileList;

  constructor(private _planService: PlanService, private _dialog: MatDialog, private _datePipe: CrytonDatetimePipe) {}

  ngOnInit(): void {
    this.dataSource = new PlanTableDataSource(this._planService, this._datePipe);
    this.buttons = [{ name: 'delete', icon: 'delete', func: this.deletePlan }];
  }

  /**
   * Checks if you really want to delete the item, deletes it and updates
   * the table paginator.
   *
   * @param plan Plan to be deleted.
   */
  deletePlan = (plan: Plan): Observable<string> => {
    const dialogRef = this._dialog.open(CertainityCheckComponent);

    return dialogRef.afterClosed().pipe(
      mergeMap(res => (res ? this._planService.deleteItem(plan.id) : (of(null) as Observable<string>))),
      tap(res => {
        if (res) {
          this.table.updatePaginator();
        }
      })
    );
  };
}
