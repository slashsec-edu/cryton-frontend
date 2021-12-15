import { Observable } from 'rxjs';
import { HasID } from 'src/app/models/cryton-table/interfaces/has-id.interface';
import { TableButton } from './table-button';

export abstract class ActionButton<T extends HasID> extends TableButton {
  constructor() {
    super();
  }

  abstract executeAction(row: T): Observable<string>;
}
