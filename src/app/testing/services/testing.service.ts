import { TableFilter } from '../../models/cryton-table/interfaces/table-filter.interface';
import { TableData } from '../../models/api-responses/table-data.interface';
import { Observable, of } from 'rxjs';

export type CrytonRecord = string | number;

export class TestingService<T> {
  constructor(private _data: T[]) {}

  fetchItems(offset?: number, limit?: number, orderBy?: string, filter?: TableFilter): Observable<TableData<T>> {
    let results: T[] = this._data;

    if (filter) {
      results = results.filter(item => {
        if (item[filter.column]) {
          const columnValue = (item[filter.column] as CrytonRecord).toString();
          return columnValue.toLowerCase().includes(filter.filter.toLowerCase());
        }
        return false;
      });
    }

    if (orderBy) {
      results = results.sort((a: T, b: T) => {
        const hasReversedOrder = orderBy.startsWith('-');
        const order = hasReversedOrder ? orderBy.slice(1) : orderBy;

        if (!a[order] && !b[order]) {
          return 0;
        } else if (!a[order]) {
          return 1;
        } else if (!b[order]) {
          return 0;
        }

        const first = (a[order] as CrytonRecord).toString();
        const second = (b[order] as CrytonRecord).toString();

        return hasReversedOrder ? second.localeCompare(first) : first.localeCompare(second);
      });
    }

    if (offset != null && limit != null) {
      results = results.slice(offset, offset + limit);
    }

    return of({ count: this._data.length, data: results });
  }

  postItem(): Observable<Record<string, never> | never> {
    return of({});
  }

  setData(data: T[]): void {
    this._data = data;
  }
}
