import { Column } from '../cryton-table/interfaces/column.interface';
import { Run } from '../api-responses/run.interface';
import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';
import { RunService } from 'src/app/services/run.service';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';

export class RunTableDataSource extends CrytonTableDataSource<Run> {
  columns: Column[] = [
    {
      name: 'id',
      display: 'ID',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'state',
      display: 'STATE',
      highlight: true,
      filterable: true,
      sortable: true
    },
    {
      name: 'plan_executions',
      display: 'WORKERS',
      highlight: false,
      filterable: false,
      sortable: false
    },
    {
      name: 'schedule_time',
      display: 'SCHEDULE',
      highlight: false,
      filterable: false,
      sortable: true
    }
  ];
  displayFunctions: ((input: Run) => string)[] = [
    null,
    null,
    (input: Run): string => input.plan_executions.length.toString(),
    (input: Run): string => this._crytonDatetime.transform(input.schedule_time)
  ];
  highlightDictionary = {
    pending: 'yellow',
    scheduled: 'yellow',
    running: 'blue',
    finished: 'green',
    pausing: 'gray',
    paused: 'black',
    terminated: 'red'
  };

  constructor(protected runService: RunService, private _crytonDatetime: CrytonDatetimePipe) {
    super(runService);
  }
}
