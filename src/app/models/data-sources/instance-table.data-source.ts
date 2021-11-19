import { Instance } from '../api-responses/instance.interface';
import { InstanceService } from 'src/app/services/instance.service';
import { Column } from '../cryton-table/interfaces/column.interface';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';

export class InstanceTableDataSource extends CrytonTableDataSource<Instance> {
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
    (input: Instance): string => this._datePipe.transform(input.created_at),
    (input: Instance): string => input.runs.length.toString()
  ];
  highlightDictionary = {};

  constructor(protected instanceService: InstanceService, private _datePipe: CrytonDatetimePipe) {
    super(instanceService);
  }
}
