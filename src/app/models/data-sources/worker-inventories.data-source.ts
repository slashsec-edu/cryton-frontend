import { Column } from '../cryton-table/interfaces/column.interface';
import { Worker } from '../api-responses/worker.interface';
import { WorkerInventoriesService } from 'src/app/services/worker-inventories.service';
import { CrytonTableDataSource } from 'src/app/generics/cryton-table.datasource';

export class WorkerInventoriesDataSource extends CrytonTableDataSource<Worker> {
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

  constructor(protected dataService: WorkerInventoriesService) {
    super(dataService);
  }
}
