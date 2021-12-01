import { DataSource } from '@angular/cdk/collections/data-source';
import { BehaviorSubject } from 'rxjs';
import { Observable, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CrytonRESTApiService } from './cryton-rest-api-service';
import { TableFilter } from '../models/cryton-table/interfaces/table-filter.interface';
import { HasID } from '../models/cryton-table/interfaces/has-id.interface';

export abstract class TableDataSource<T extends HasID> implements DataSource<T> {
  private _dataSubject$ = new BehaviorSubject<T[]>([]);
  private _countSubject$ = new BehaviorSubject<number>(0);
  private _loadingSubject$ = new BehaviorSubject<boolean>(false);
  private _currentSub: Subscription;

  constructor(private _service?: CrytonRESTApiService<T>) {}

  connect(): Observable<T[]> {
    return this._dataSubject$.asObservable();
  }

  disconnect(): void {
    this._dataSubject$.complete();
  }

  /**
   * Returns the total item count.
   */
  getCount(): Observable<number> {
    return this._countSubject$.asObservable();
  }

  /**
   * Says if data source is loading data.
   */
  isLoading(): Observable<boolean> {
    return this._loadingSubject$.asObservable();
  }

  /**
   * Setter for isLoading observable.
   *
   * @param isLoading Boolean.
   */
  setLoading(isLoading: boolean): void {
    this._loadingSubject$.next(isLoading);
  }

  /**
   * Overwrites dataSubject to a given subject. Can be used for loading data
   * without a service.
   *
   * @param data BehaviorSubject containing table data.
   */
  setDataSubject(data$: BehaviorSubject<T[]>): void {
    this._dataSubject$ = data$;
  }

  /**
   * Fetches data from a service and emits them from the data subject.
   *
   * @param offset Page offset.
   * @param limit Page size.
   * @param sort Column to order results by.
   * @param filter TableFilter object for filtering results by column and search value.
   */
  loadItems(offset: number, limit: number, sort: string, filter: TableFilter): void {
    if (this._currentSub) {
      this._currentSub.unsubscribe();
    }
    this._loadingSubject$.next(true);

    this._currentSub = this._service
      .fetchItems(offset, limit, sort, filter)
      .pipe(catchError(() => of({ count: 0, data: [] })))
      .subscribe(items => {
        this._countSubject$.next(items.count);
        this._dataSubject$.next(items.data);
        this._loadingSubject$.next(false);
      });
  }

  updateRow(row: T): void {
    const updatedRow = this._dataSubject$.value.find(currentRow => currentRow.id === row.id);
    Object.assign(updatedRow, row);
  }
}
