import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { CrytonResponse } from '../models/api-responses/cryton-response.interface';
import { CrytonRESTApiEndpoint } from '../models/enums/cryton-rest-api-endpoint.enum';

export type LogsResponse = CrytonResponse<string>;

@Injectable({
  providedIn: 'root'
})
export class LogService {
  endpoint = CrytonRESTApiService.buildEndpointURL(CrytonRESTApiEndpoint.LOGS, 'v1');

  constructor(private _http: HttpClient) {}

  fetchItems(offset = 0, limit = 0, filter = ''): Observable<LogsResponse> {
    const params: HttpParams = new HttpParams()
      .set('offset', offset?.toString() ?? '0')
      .set('limit', limit?.toString() ?? '0')
      .set('filter', filter ?? '');

    return this._http.get<LogsResponse>(this.endpoint, { params });
  }
}
