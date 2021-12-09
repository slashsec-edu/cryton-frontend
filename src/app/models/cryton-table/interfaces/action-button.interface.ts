import { Observable } from 'rxjs';
import { TableButton } from './table-button.interface';

export interface ActionButton<T> extends TableButton {
  func(row: T): Observable<string>;
}
