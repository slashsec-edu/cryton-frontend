import { Observable } from 'rxjs';
import { TableButton } from './table-button.interface';

export interface ActionButton<T> extends TableButton {
  loading$?: Observable<boolean>;
  rowUpdate$?: Observable<T>;
  func(row: T): Observable<string>;
}
