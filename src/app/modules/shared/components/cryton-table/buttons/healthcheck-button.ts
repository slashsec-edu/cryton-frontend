import { Observable, throwError } from 'rxjs';
import { tap, catchError, delay, map } from 'rxjs/operators';
import { WorkersService } from 'src/app/services/workers.service';
import { ApiActionButton } from './api-action-button';
import { Worker } from 'src/app/models/api-responses/worker.interface';
import { environment } from 'src/environments/environment';

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
        return throwError('Healthcheck failed.');
      })
    );
  }
}
