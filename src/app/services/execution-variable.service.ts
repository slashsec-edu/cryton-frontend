import { Injectable } from '@angular/core';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { HttpClient } from '@angular/common/http';
import { CrytonRESTApiEndpoint } from '../models/enums/cryton-rest-api-endpoint.enum';

@Injectable({
  providedIn: 'root'
})
export class ExecutionVariableService extends CrytonRESTApiService<Record<string, any>> {
  protected _endpoint = CrytonRESTApiService.buildEndpointURL(CrytonRESTApiEndpoint.EXECUTION_VARS, 'v1');

  constructor(protected http: HttpClient) {
    super(http);
  }
}
