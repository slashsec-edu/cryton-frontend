import { Injectable } from '@angular/core';
import { Worker } from '../models/api-responses/worker.interface';
import { TableData } from '../models/api-responses/table-data.interface';
import { CrytonResponse } from '../models/api-responses/cryton-response.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrytonDataService } from '../generics/cryton-data.service';
import { Observable } from 'rxjs';
import { map, catchError, filter, mergeMap, toArray } from 'rxjs/operators';
import { TableFilter } from '../models/cryton-table/interfaces/table-filter.interface';
import { environment } from 'src/environments/environment';
import { Endpoint } from '../models/enums/endpoint.enum';

@Injectable({
  providedIn: 'root'
})
export class WorkerInventoriesService extends CrytonDataService<Worker> {
  protected endpoint = `${environment.baseUrl}${Endpoint.WORKERS}`;
  private _workers: Worker[] = [];

  constructor(protected http: HttpClient) {
    super(http);
  }

  setWorkers(workers: Worker[]): void {
    this._workers = workers;
  }

  /**
   * Fetches all items from an enpoint filtered by query parameters.
   *
   * @param offset Page offset.
   * @param limit Page size.
   * @param orderBy Column to order results by.
   * @param filter TableFilter object for filtering results by column and search value.
   */
  fetchItems(
    offset: number,
    limit: number,
    orderBy: string = 'id',
    tableFilter: TableFilter
  ): Observable<TableData<Worker>> {
    let params: HttpParams = new HttpParams().set('offset', offset.toString()).set('limit', limit.toString());

    if (orderBy && orderBy !== '') {
      params = params.append('order_by', orderBy);
    }
    if (tableFilter && tableFilter.filter && tableFilter.column) {
      params = params.append(tableFilter.column, tableFilter.filter);
    }

    return this.http
      .get<CrytonResponse<Worker>>(this.endpoint, { params })
      .pipe(
        mergeMap(items => items.results),
        filter((item: Worker) =>
          Array.from(this._workers)
            .map(worker => worker.id)
            .includes(item.id)
        ),
        toArray(),
        map(items => ({ count: items.length, data: items } as TableData<Worker>)),
        catchError(err => this.handleError(err))
      );
  }
}