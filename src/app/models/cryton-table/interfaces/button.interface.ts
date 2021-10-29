import { Observable } from 'rxjs';

export interface Button<T> {
  icon: string;
  func(row: T): Observable<string>;
}
