import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { PlanService } from 'src/app/services/plan.service';
import { Plan } from '../api-responses/plan.interface';
import { Column } from '../cryton-table/interfaces/column.interface';

export class PlanTableDataSource extends CrytonTableDataSource<Plan> {
  columns: Column[] = [
    {
      name: 'id',
      display: 'ID',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'name',
      display: 'NAME',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'owner',
      display: 'OWNER',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'created_at',
      display: 'CREATED AT',
      highlight: false,
      filterable: false,
      sortable: true
    },
    {
      name: 'runs',
      display: 'RUNS',
      highlight: false,
      filterable: false,
      sortable: false
    }
  ];
  displayFunctions = [
    null,
    null,
    null,
    (input: Plan): string => this._datePipe.transform(input.created_at),
    (input: Plan): string => input.runs.length.toString()
  ];
  highlightDictionary = {};

  constructor(protected _planService: PlanService, private _datePipe: CrytonDatetimePipe) {
    super(_planService);
  }
}
