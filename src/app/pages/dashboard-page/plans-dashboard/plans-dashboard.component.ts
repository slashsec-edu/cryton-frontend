import { Component, OnInit } from '@angular/core';
import { PlanService } from 'src/app/services/plan.service';
import { PlanTableDataSource } from 'src/app/models/data-sources/plan-table.data-source';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { LinkButton } from 'src/app/models/cryton-table/interfaces/link-button.interface';
import { Plan } from 'src/app/models/api-responses/plan.interface';

@Component({
  selector: 'app-plans-dashboard',
  templateUrl: './plans-dashboard.component.html'
})
export class PlansDashboardComponent implements OnInit {
  dataSource: PlanTableDataSource;
  linkButtons: LinkButton<Plan>[];
  searchValue = '';

  constructor(private _planService: PlanService, private _datePipe: CrytonDatetimePipe) {}

  ngOnInit(): void {
    this.dataSource = new PlanTableDataSource(this._planService, this._datePipe);
    this.linkButtons = [
      { name: 'Show YAML', icon: 'description', constructLink: (row: Plan) => `/app/plans/${row.id}/yaml` }
    ];
  }
}
