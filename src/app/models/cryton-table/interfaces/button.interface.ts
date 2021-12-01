import { Observable } from 'rxjs';

export interface Button<T> {
  name: string;
  icon: string;
  func(row: T): Observable<string>;
}
