import { Injectable } from '@angular/core';
import { Worker, WorkerExecution } from '../models/api-responses/worker.interface';
import { HttpClient } from '@angular/common/http';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { Observable } from 'rxjs';
import { RunService } from './run.service';
import { concatAll, map, mergeMap, pluck, tap, toArray } from 'rxjs/operators';
import { PlanExecution } from '../models/api-responses/plan-execution.interface';
import { TableData } from '../models/api-responses/table-data.interface';
import { Endpoint } from '../models/enums/endpoint.enum';
import { WorkerHealth } from '../models/api-responses/worker-health.interface';

@Injectable({
  providedIn: 'root'
})
export class WorkersService extends CrytonRESTApiService<Worker> {
  endpoint = CrytonRESTApiService.buildEndpointURL(Endpoint.WORKERS, 'v1');

  constructor(protected http: HttpClient, private _runService: RunService) {
    super(http);
  }

  fetchWorkersOfRun(runId: number, offset = 0, limit = 4): Observable<TableData<WorkerExecution>> {
    let count = 0;

    return this._runService.fetchItem(runId).pipe(
      pluck('plan_executions'),
      tap((executions: string[]) => (count = executions.length)),
      map((executions: string[]) => executions.slice(offset, offset + limit)),
      concatAll(),
      mergeMap(executionUrl =>
        this.http.get<PlanExecution>(executionUrl).pipe(
          mergeMap((execution: PlanExecution) => this.fetchItemByUrl(execution.worker)),
          map((worker: Worker) => ({ execution_url: executionUrl, ...worker } as WorkerExecution))
        )
      ),
      toArray(),
      map((workers: WorkerExecution[]) => ({ count, data: workers } as TableData<WorkerExecution>))
    );
  }

  healthCheck(workerID: number): Observable<WorkerHealth> {
    return this.http.post<WorkerHealth>(`${this.endpoint}${workerID}/healthcheck/`, {});
  }
}
