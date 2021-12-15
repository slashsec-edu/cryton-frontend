import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PlanTableDataSource } from 'src/app/models/data-sources/plan-table.data-source';
import { Plan } from 'src/app/models/api-responses/plan.interface';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { PlanService } from 'src/app/services/plan.service';
import { TableButton } from 'src/app/modules/shared/components/cryton-table/buttons/table-button';
import { DeleteButton } from 'src/app/modules/shared/components/cryton-table/buttons/delete-button';
import { LinkButton } from 'src/app/modules/shared/components/cryton-table/buttons/link-button';

@Component({
  selector: 'app-list-plans',
  templateUrl: './list-plans.component.html',
  styleUrls: ['./list-plans.component.scss']
})
export class ListPlansComponent implements OnInit {
  @ViewChild(CrytonTableComponent) table: CrytonTableComponent<Plan>;

  dataSource: PlanTableDataSource;
  buttons: TableButton[];
  filesToUpload: FileList;

  constructor(private _planService: PlanService, private _dialog: MatDialog, private _datePipe: CrytonDatetimePipe) {}

  ngOnInit(): void {
    this.dataSource = new PlanTableDataSource(this._planService, this._datePipe);
    this.buttons = [
      new LinkButton('Show YAML', 'description', '/app/plans/:id/yaml'),
      new DeleteButton(this._planService, this._dialog)
    ];
  }
}
