import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { PlanExecution } from '../models/api-responses/plan-execution.interface';
import { Run } from '../models/api-responses/run.interface';
import { catchError, concatAll, first, mapTo, mergeMap, pluck, switchMap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import { Report } from '../models/api-responses/report/report.interface';
import { ExecutionVariableService } from './execution-variable.service';
import { Endpoint } from '../models/enums/endpoint.enum';
import { HasYaml } from '../models/services/has-yaml.interface';

export interface RunResponse {
  detail: {
    id: number;
    link: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RunService extends CrytonRESTApiService<Run> implements HasYaml {
  endpoint = CrytonRESTApiService.buildEndpointURL(Endpoint.RUNS, 'v1');

  constructor(protected http: HttpClient, private _execVarService: ExecutionVariableService) {
    super(http);
  }

  scheduleRun(date: Date, runID: number): Observable<string> {
    const body = { start_time: this._formatDate(date) };

    return this._runAction(runID, 'schedule', body).pipe(
      mapTo(`Run with ID: ${runID} scheduled successfully.`),
      catchError(err => this.handleItemError(err, `Scheudling run with ID: ${runID} failed.`))
    );
  }

  rescheduleRun(date: Date, runID: number): Observable<string> {
    const body = { start_time: this._formatDate(date) };

    return this._runAction(runID, 'reschedule', body).pipe(
      mapTo(`Run with ID: ${runID} rescheduled successfully.`),
      catchError(err => this.handleItemError(err, `Rescheduling run with ID: ${runID} failed.`))
    );
  }

  unscheduleRun(runID: number): Observable<string> {
    return this._runAction(runID, 'unschedule').pipe(
      mapTo(`Run with ID: ${runID} unscheduled successfully.`),
      catchError(err => this.handleItemError(err, `Unscheduling run with ID: ${runID} failed.`))
    );
  }

  pauseRun(runID: number): Observable<string> {
    return this._runAction(runID, 'pause').pipe(
      mapTo(`Run with ID: ${runID} paused successfully.`),
      catchError(err => this.handleItemError(err, `Pausing run with ID: ${runID} failed.`))
    );
  }

  unpauseRun(runID: number): Observable<string> {
    return this._runAction(runID, 'unpause').pipe(
      mapTo(`Run with ID: ${runID} unpaused successfully.`),
      catchError(err => this.handleItemError(err, `Unpausing run with ID: ${runID} failed.`))
    );
  }

  executeRun(runID: number): Observable<string> {
    return this._runAction(runID, 'execute').pipe(
      mapTo(`Run with ID: ${runID} started successfully.`),
      catchError(err => this.handleItemError(err, `Execution of run with ID: ${runID} failed.`))
    );
  }

  killRun(runID: number): Observable<string> {
    return this._runAction(runID, 'kill').pipe(
      mapTo(`Run with ID: ${runID} killed successfully.`),
      catchError(err => this.handleItemError(err, `Failed to kill run with ID: ${runID}.`))
    );
  }

  postponeRun(runID: number, delta: string): Observable<string> {
    return this._runAction(runID, 'postpone', { delta }).pipe(
      mapTo(`Run with ID: ${runID} postponed successfully.`),
      catchError(err => this.handleItemError(err, `Failed to postpone run with ID: ${runID}.`))
    );
  }

  /**
   * Posts a run and uploads execution variables for each plan execution.
   *
   * @param body Run body.
   * @param variables Record with keys as worker ids and values as execution variables.
   * @returns Observable of alert message.
   */
  postRun(body: Record<string, any>, variables: Record<number, File[] | string>): Observable<string> {
    return this.http.post<Record<string, any>>(this.endpoint, body).pipe(
      catchError(err => this.handleItemError(err, 'Run creation failed.')),
      switchMap((run: RunResponse) => this.http.get(run.detail.link)),
      pluck('plan_executions'),
      concatAll(),
      mergeMap((executionUrl: string) => this.http.get(executionUrl)),
      mergeMap((execution: PlanExecution) => this.postVariables(execution, variables)),
      mapTo('Run created successfully.')
    );
  }

  postVariables(execution: PlanExecution, variables: Record<number, File[] | string>): Observable<string> {
    const worker = execution.worker;
    const workersVariables = variables[this._getWorkerID(worker)];

    if (workersVariables && workersVariables.length > 0) {
      return of(workersVariables).pipe(
        mergeMap(vars => {
          if (Array.isArray(vars)) {
            return this._execVarService.uploadVariables(execution.id, vars);
          } else {
            return this._execVarService.postItem({ plan_execution_id: execution.id, inventory_file: vars });
          }
        }),
        catchError(() => throwError('Run created but failed to upload execution variables.'))
      );
    } else {
      return of('');
    }
  }

  /**
   * Fetches report from a run with giver run ID.
   *
   * @param runID ID of a run.
   * @returns Observable of the report from a run.
   */
  fetchReport(runID: number): Observable<Report> {
    return this.http.get<Report>(`${this.endpoint}/${runID}/report`);
  }

  fetchYaml(runID: number): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.endpoint}/${runID}/get_plan`);
  }

  downloadReport(runID: number): void {
    this.fetchReport(runID)
      .pipe(first())
      .subscribe(report => {
        const blob = new Blob([JSON.stringify(report)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'report.json';
        link.click();
        link.remove();
      });
  }

  /**
   * Gets the ID of the worker from the last part of workers URL. (.../ID/)
   *
   * @param workerUrl URL of the worker.
   */
  private _getWorkerID(workerUrl: string): number {
    let index = workerUrl.length - 2;

    while (workerUrl[index] !== '/') {
      index--;
    }

    return parseInt(workerUrl.slice(index + 1, workerUrl.length - 1), 10);
  }

  private _runAction(runID: number, action: string, body: Record<string, any> = {}): Observable<Record<string, any>> {
    const runUrl = `${this.endpoint}${runID}/${action}/`;

    return this.http.post<Record<string, any>>(runUrl, body);
  }

  /**
   * Converts date to format accepted by the backend.
   *
   * @param date Date to convert.
   * @returns Converted date string.
   */
  private _formatDate(date: Date): string {
    return date.toISOString();
  }
}
