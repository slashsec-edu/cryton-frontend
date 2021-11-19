import { TableDataSource } from 'src/app/generics/table.datasource';
import { WorkersService } from 'src/app/services/workers.service';
import { Worker } from '../api-responses/worker.interface';

export class WorkersDashboardDataSource extends TableDataSource<Worker> {
  constructor(protected workersService: WorkersService) {
    super(workersService);
  }
}
