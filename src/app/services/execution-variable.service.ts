import { Injectable } from '@angular/core';
import { CrytonDataService } from '../generics/cryton-data.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Endpoint } from '../models/enums/endpoint.enum';

@Injectable({
  providedIn: 'root'
})
export class ExecutionVariableService extends CrytonDataService<Record<string, any>> {
  endpoint = `${environment.baseUrl}${Endpoint.EXECUTION_VARS}`;

  constructor(protected http: HttpClient) {
    super(http);
  }
}
