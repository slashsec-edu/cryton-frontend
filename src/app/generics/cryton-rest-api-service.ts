import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, mapTo } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CrytonResponse } from '../models/api-responses/cryton-response.interface';
import { TableData } from '../models/api-responses/table-data.interface';
import { TableFilter } from '../models/cryton-table/interfaces/table-filter.interface';
import { Endpoint } from '../models/enums/endpoint.enum';

export abstract class CrytonRESTApiService<T> {
  static baseUrl = `http://${environment.crytonRESTApiHost}:${environment.crytonRESTApiPort}/cryton/api`;
  abstract endpoint: string;

  constructor(protected http: HttpClient) {}

  static buildEndpointURL(endpoint: Endpoint, version: string): string {
    return `${this.baseUrl}/${version}/${endpoint}`;
  }

  postItem(body: Record<string, unknown> | FormData): Observable<string> {
    return this.http.post<Record<string, unknown>>(this.endpoint, body).pipe(
      mapTo('Item created successfully.'),
      catchError((err: Error) => {
        console.error(err);
        return throwError(() => new Error('Item creation failed.'));
      })
    );
  }

  deleteItem(id: number): Observable<string> {
    const url = `${this.endpoint}${id}`;

    return this.http.delete<Record<string, string>>(url).pipe(
      mapTo('Item deleted successfully.'),
      catchError((err: HttpErrorResponse) => {
        console.error(err);
        return throwError(() => new Error('Item deletion failed.'));
      })
    );
  }

  fetchItem(id: number): Observable<T | string> {
    const url = `${this.endpoint}${id}`;

    return this.http
      .get<T>(url)
      .pipe(catchError((err: HttpErrorResponse) => this.handleItemError(err, `Item couldn't be fetched.`)));
  }

  fetchItemByUrl(url: string): Observable<T | string> {
    return this.http
      .get<T>(url)
      .pipe(catchError((err: HttpErrorResponse) => this.handleItemError(err, `Item couldn't be fetched.`)));
  }

  /**
   * Fetches all items from an enpoint filtered by query parameters.
   *
   * @param offset Page offset.
   * @param limit Page size.
   * @param orderBy Column to order results by.
   * @param filter TableFilter object for filtering results by column and search value.
   */
  fetchItems(offset?: number, limit?: number, orderBy = 'id', filter?: TableFilter): Observable<TableData<T>> {
    let params: HttpParams = new HttpParams();

    if (offset) {
      params = params.set('offset', offset.toString());
    }
    if (limit) {
      params = params.set('limit', limit.toString());
    }
    if (orderBy && orderBy !== '') {
      params = params.append('order_by', orderBy);
    }
    if (filter && filter.filter && filter.column) {
      params = params.append(filter.column, filter.filter);
    }

    return this.http.get<CrytonResponse<T>>(this.endpoint, { params }).pipe(
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
    return throwError(() => new Error(msg));
  };
}
