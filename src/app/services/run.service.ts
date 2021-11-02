import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { PlanExecution } from '../models/api-responses/plan-execution.interface';
import { Run } from '../models/api-responses/run.interface';
import { catchError, concatAll, first, mapTo, mergeMap, pluck, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Report } from '../models/api-responses/report/report.interface';
import { CrytonRESTApiEndpoint } from '../models/enums/cryton-rest-api-endpoint.enum';

export interface RunResponse {
  detail: {
    id: number;
    link: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RunService extends CrytonRESTApiService<Run> {
  protected _endpoint = CrytonRESTApiService.buildEndpointURL(CrytonRESTApiEndpoint.RUNS, 'v1');
  private _variablesEndpoint = CrytonRESTApiService.buildEndpointURL(CrytonRESTApiEndpoint.EXECUTION_VARS, 'v1');

  constructor(protected http: HttpClient) {
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
      mapTo(`Execution of run run with ID: ${runID} started successfully.`),
      catchError(err => this.handleItemError(err, `Execution of run with ID: ${runID} failed.`))
    );
  }

  /**
   * Sends a POST request to create a run and uploads
   * selected execution variables to created plan executions.
   *
   * @param body Body of request.
   * @param inventoryFiles Selected inventory files (execution variables).
   */
  postRun(body: Record<string, any>, inventoryFiles: Record<string, any>): Observable<string> {
    return this.http.post<Record<string, any>>(this._endpoint, body).pipe(
      switchMap((run: RunResponse) => this.http.get(run.detail.link)),
      pluck('plan_executions'),
      concatAll(),
      mergeMap((executionUrl: string) => this.http.get(executionUrl)),
      mergeMap((execution: PlanExecution) => {
        const worker = execution.worker;
        const workersFiles = inventoryFiles[this._getWorkerID(worker)] as File[];

        if (workersFiles) {
          return of(workersFiles).pipe(
            mergeMap(files => {
              const formData = this._createFormData(execution.id, files);
              return this.http.post(this._variablesEndpoint, formData);
            })
          );
        } else {
          return of(null);
        }
      }),
      mapTo('Run created successfully.'),
      catchError(err => this.handleItemError(err, 'Run creation failed.'))
    );
  }

  /**
   * Fetches report from a run with giver run ID.
   *
   * @param runID ID of a run.
   * @returns Observable of the report from a run.
   */
  fetchReport(runID: number): Observable<Report> {
    return this.http.get<Report>(`${this._endpoint}/${runID}/report`);
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
   * Creates a form data object for a POST request
   * to execution variables endpoint.
   *
   * @param executionID ID of the plan execution.
   * @param files Array of inventory files.
   */
  private _createFormData(executionID: number, files?: File[]): FormData {
    const formData = new FormData();
    formData.append('plan_execution_id', executionID.toString());

    for (const file of files) {
      formData.append('inventory_file', file, 'inventory_file');
    }

    return formData;
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
    const runUrl = `${this._endpoint}${runID}/${action}/`;

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
