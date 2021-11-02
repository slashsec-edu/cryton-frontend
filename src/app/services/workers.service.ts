import { Injectable } from '@angular/core';
import { Worker } from '../models/api-responses/worker.interface';
import { HttpClient } from '@angular/common/http';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { CrytonRESTApiEndpoint } from '../models/enums/cryton-rest-api-endpoint.enum';

@Injectable({
  providedIn: 'root'
})
export class WorkersService extends CrytonRESTApiService<Worker> {
  protected _endpoint = CrytonRESTApiService.buildEndpointURL(CrytonRESTApiEndpoint.WORKERS, 'v1');

  constructor(protected http: HttpClient) {
    super(http);
  }
}
