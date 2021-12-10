import { HttpErrorResponse, HttpParams, HttpClient } from '@angular/common/http';
import { of, Observable, throwError } from 'rxjs';
import { map, catchError, mapTo } from 'rxjs/operators';
import { TableData } from '../models/api-responses/table-data.interface';
import { CrytonResponse } from '../models/api-responses/cryton-response.interface';
import { TableFilter } from '../models/cryton-table/interfaces/table-filter.interface';
import { CrytonRESTApiEndpoint } from '../models/enums/cryton-rest-api-endpoint.enum';
import { environment } from 'src/environments/environment';

export abstract class CrytonRESTApiService<T> {
  static baseUrl = `http://${environment.crytonRESTApiHost}:${environment.crytonRESTApiPort}/cryton/api`;
  abstract endpoint: string;

  constructor(protected http: HttpClient) {}

  static buildEndpointURL(endpoint: CrytonRESTApiEndpoint, version: string): string {
    return `${this.baseUrl}/${version}/${endpoint}`;
  }

  postItem(body: Record<string, any>): Observable<string> {
    return this.http.post<Record<string, any>>(this.endpoint, body).pipe(
      mapTo('Item created successfully.'),
      catchError(err => {
        console.error(err);
        return throwError('Item creation failed.');
      })
    );
  }

  deleteItem(id: number): Observable<string> {
    const url = `${this.endpoint}${id}`;

    return this.http.delete<Record<string, string>>(url).pipe(
      mapTo('Item deleted successfully.'),
      catchError(err => {
        console.error(err);
        return throwError('Item deletion failed.');
      })
    );
  }

  fetchItem(id: number): Observable<T | string> {
    const url = `${this.endpoint}${id}`;

    return this.http.get<T>(url).pipe(catchError(err => this.handleItemError(err, `Item couldn't be fetched.`)));
  }

  fetchItemByUrl(url: string): Observable<T | string> {
    return this.http.get<T>(url).pipe(catchError(err => this.handleItemError(err, `Item couldn't be fetched.`)));
  }

  /**
   * Fetches all items from an enpoint filtered by query parameters.
   *
   * @param offset Page offset.
   * @param limit Page size.
   * @param orderBy Column to order results by.
   * @param filter TableFilter object for filtering results by column and search value.
   */
  fetchItems(offset?: number, limit?: number, orderBy: string = 'id', filter?: TableFilter): Observable<TableData<T>> {
    let params: HttpParams = new HttpParams();

    if (offset) {
      params.set('offset', offset.toString());
    }
    if (limit) {
      params.set('limit', limit.toString());
    }
    if (orderBy && orderBy !== '') {
      params = params.append('order_by', orderBy);
    }
    if (filter && filter.filter && filter.column) {
      params = params.append(filter.column, filter.filter);
    }

    return this.http
      .get<CrytonResponse<T>>(this.endpoint, { params })
      .pipe(
        map(items => ({ count: items.count, data: items.results } as TableData<T>)),
        catchError(this.handleDatasetError)
      );
  }

  protected handleDatasetError = (error: HttpErrorResponse): Observable<TableData<T>> => {
    console.error(error);
    return of({ count: 0, data: [] });
  };

  protected handleItemError = (error: HttpErrorResponse, msg: string): Observable<string> => {
    console.error(error);
    return throwError(msg);
  };
}
