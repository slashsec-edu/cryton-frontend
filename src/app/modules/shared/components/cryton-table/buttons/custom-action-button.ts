import { Observable } from 'rxjs';
import { HasID } from 'src/app/models/cryton-table/interfaces/has-id.interface';
import { ActionButton } from './action-button';

export class CustomActionButton<T extends HasID> extends ActionButton<T> {
  name: string;
  icon: string;
  customFunc: (row: T) => Observable<string>;

  constructor(name: string, icon: string, customFunc: (row: T) => Observable<string>) {
    super();
    this.name = name;
    this.icon = icon;
    this.customFunc = customFunc;
  }

  executeAction(row: T): Observable<string> {
    return this.customFunc(row);
  }
}
