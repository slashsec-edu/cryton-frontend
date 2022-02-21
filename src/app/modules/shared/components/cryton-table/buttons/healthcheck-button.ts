import { Observable, throwError } from 'rxjs';
import { catchError, delay, map, tap } from 'rxjs/operators';
import { Worker } from 'src/app/models/api-responses/worker.interface';
import { WorkersService } from 'src/app/services/workers.service';
import { environment } from 'src/environments/environment';
import { ApiActionButton } from './api-action-button';

export class HealthCheckButton extends ApiActionButton<Worker> {
  name = 'Healthcheck';
  icon = 'health_and_safety';

  constructor(private _workersService: WorkersService) {
    super();
  }

  executeAction(worker: Worker): Observable<string> {
    const workerCopy = JSON.parse(JSON.stringify(worker)) as Worker;
    this.addToLoading(worker);

    return this._workersService.healthCheck(worker.id).pipe(
      delay(environment.refreshDelay),
      tap(result => {
        workerCopy.state = result.detail.worker_state;
        this._rowUpdate$.next(workerCopy);
        this.removeFromLoading(worker);
      }),
      map(result => `Worker ${worker.id} is ${result.detail.worker_state}.`),
      catchError(() => {
        this.removeFromLoading(worker);
        return throwError(() => new Error('Healthcheck failed.'));
      })
    );
  }
}
