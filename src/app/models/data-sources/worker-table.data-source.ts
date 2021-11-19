import { Column } from '../cryton-table/interfaces/column.interface';
import { WorkersService } from 'src/app/services/workers.service';
import { Worker } from '../api-responses/worker.interface';
import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';

export class WorkerTableDataSource extends CrytonTableDataSource<Worker> {
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
      name: 'name',
      display: 'NAME',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'address',
      display: 'ADDRESS',
      highlight: false,
      filterable: true,
      sortable: true
    },
    {
      name: 'q_prefix',
      display: 'Q-PREFIX',
      highlight: false,
      filterable: true,
      sortable: true
    }
  ];
  displayFunctions: ((input: Worker) => string)[] = [
    null,
    null,
    null,
    null,
    (input: Worker): string => input.q_prefix.toString()
  ];
  highlightDictionary = {
    ready: 'blue',
    down: 'black',
    up: 'green'
  };

  constructor(protected workersService: WorkersService) {
    super(workersService);
  }
}
