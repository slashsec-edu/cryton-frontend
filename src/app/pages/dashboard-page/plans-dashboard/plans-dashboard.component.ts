import { Component, OnInit } from '@angular/core';
import { PlanService } from 'src/app/services/plan.service';
import { PlanTableDataSource } from 'src/app/models/data-sources/plan-table.data-source';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';

@Component({
  selector: 'app-plans-dashboard',
  templateUrl: './plans-dashboard.component.html'
})
export class PlansDashboardComponent implements OnInit {
  dataSource: PlanTableDataSource;
  buttons = [];
  searchValue = '';

  constructor(private _planService: PlanService, private _datePipe: CrytonDatetimePipe) {}

  ngOnInit(): void {
    this.dataSource = new PlanTableDataSource(this._planService, this._datePipe);
  }
}
