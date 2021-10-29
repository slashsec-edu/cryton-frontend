import { BehaviorSubject, Subscription, of } from 'rxjs';
import { Worker } from '../api-responses/worker.interface';
import { TableData } from '../api-responses/table-data.interface';
import { catchError } from 'rxjs/operators';
import { WorkersService } from '../../services/workers.service';

export class WorkersDashboardDataSource {
  dataSubject$ = new BehaviorSubject<Worker[]>([]);
  loadingSubject$ = new BehaviorSubject<boolean>(false);
  currentSub: Subscription;
  itemCount = 0;

  constructor(private _workersService: WorkersService) {}

  loadItems(offset: number, limit: number): void {
    if (this.currentSub) {
      this.currentSub.unsubscribe();
    }
    this.loadingSubject$.next(true);

    this.currentSub = this._workersService
      .fetchItems(offset, limit, null, null)
      .pipe(catchError(() => of({ count: 0, data: [] } as TableData<Worker>)))
      .subscribe(workers => {
        this.dataSubject$.next(workers.data);
        this.itemCount = workers.count;
        this.loadingSubject$.next(false);
      });
  }
}
