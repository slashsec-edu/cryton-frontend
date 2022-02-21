import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { ExecutionVariable } from '../models/api-responses/execution-variable.interface';
import { Endpoint } from '../models/enums/endpoint.enum';

@Injectable({
  providedIn: 'root'
})
export class ExecutionVariableService extends CrytonRESTApiService<ExecutionVariable> {
  endpoint = CrytonRESTApiService.buildEndpointURL(Endpoint.EXECUTION_VARS, 'v1');

  constructor(protected http: HttpClient) {
    super(http);
  }

  /**
   * Uploads files containing execution variable definitions to the backend.
   *
   * @param executionId ID of execution to which the variables belong.
   * @param files Array of files defining the execution variables.
   * @returns Observable of the response.
   */
  uploadVariables(executionId: number, files: File[]): Observable<string> {
    const formData = this._createFormData(executionId, files);
    return this.http.post<{ detail: string }>(this.endpoint, formData).pipe(
      catchError((err: HttpErrorResponse) => this.handleItemError(err, 'File upload failed.')),
      mapTo('File uploaded successfully.')
    );
  }

  /**
   * Creates a form data object for a POST request
   * to upload execution variables.
   *
   * @param executionID ID of the plan execution.
   * @param files Array of inventory files.
   * @returns FormData object.
   */
  private _createFormData(executionID: number, files?: File[]): FormData {
    const formData = new FormData();
    formData.append('plan_execution_id', executionID.toString());

    for (const file of files) {
      formData.append('inventory_file', file, 'inventory_file');
    }

    return formData;
  }
}
