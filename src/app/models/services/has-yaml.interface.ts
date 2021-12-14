import { Observable } from 'rxjs';

export interface HasYaml {
  fetchYaml(itemID: number): Observable<Record<string, unknown>>;
}
