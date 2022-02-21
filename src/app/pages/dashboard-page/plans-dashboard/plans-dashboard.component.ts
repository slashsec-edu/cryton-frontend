import { Component, OnInit } from '@angular/core';
import { PlanTableDataSource } from 'src/app/models/data-sources/plan-table.data-source';
import { LinkButton } from 'src/app/modules/shared/components/cryton-table/buttons/link-button';
import { TableButton } from 'src/app/modules/shared/components/cryton-table/buttons/table-button';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { PlanService } from 'src/app/services/plan.service';

@Component({
  selector: 'app-plans-dashboard',
  templateUrl: './plans-dashboard.component.html'
})
export class PlansDashboardComponent implements OnInit {
  dataSource: PlanTableDataSource;
  buttons: TableButton[];
  searchValue = '';

  constructor(private _planService: PlanService, private _datePipe: CrytonDatetimePipe) {}

  ngOnInit(): void {
    this.dataSource = new PlanTableDataSource(this._planService, this._datePipe);
    this.buttons = [new LinkButton('Show YAML', 'description', '/app/plans/:id/yaml')];
  }
}
