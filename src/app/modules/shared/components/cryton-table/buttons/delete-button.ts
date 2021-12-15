import { MatDialog } from '@angular/material/dialog';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, mergeMap, tap } from 'rxjs/operators';
import { CrytonRESTApiService } from 'src/app/generics/cryton-rest-api-service';
import { HasID } from 'src/app/models/cryton-table/interfaces/has-id.interface';
import { environment } from 'src/environments/environment';
import { CertainityCheckComponent } from '../../certainity-check/certainity-check.component';
import { ApiActionButton } from './api-action-button';

export class DeleteButton<T extends HasID> extends ApiActionButton<T> {
  name = 'Delete';
  icon = 'delete';

  constructor(private _service: CrytonRESTApiService<T>, private _dialog: MatDialog) {
    super();
  }

  executeAction(row: T): Observable<string> {
    const dialogRef = this._dialog.open(CertainityCheckComponent);

    return dialogRef.afterClosed().pipe(
      mergeMap(res => {
        if (res) {
          this.addToLoading(row);
          return this._service.deleteItem(row.id).pipe(
            delay(environment.refreshDelay),
            tap(() => {
              this.removeFromLoading(row);
              this._deleted$.next();
            }),
            catchError(err => {
              this.removeFromLoading(row);
              return throwError(err);
            })
          );
        } else {
          return of(null) as Observable<string>;
        }
      })
    );
  }
}
