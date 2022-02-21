import { ActivatedRoute, Params } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, first, map, pluck, switchMap, tap } from 'rxjs/operators';
import { HasYaml } from 'src/app/models/services/has-yaml.interface';
import { AlertService } from 'src/app/services/alert.service';

export abstract class YamlPreview {
  yaml$: Observable<Record<string, unknown> | null>;
  itemID: number;
  pluckArgs = ['detail', 'plan'];
  abstract itemName: string;

  constructor(protected _route: ActivatedRoute, protected _planService: HasYaml, protected _alert: AlertService) {}

  fetchYaml(): void {
    this.yaml$ = this._route.params.pipe(
      first(),
      tap((params: Params) => (this.itemID = Number(params['id']))),
      switchMap((params: Params) => this._planService.fetchYaml(params['id'] as number)),
      pluck(...this.pluckArgs),
      map(yaml => {
        const lastProperty = this.pluckArgs[this.pluckArgs.length - 1];
        const result = {};
        result[lastProperty] = yaml;
        return result;
      }),
      catchError(() => {
        this._alert.showError('Fetching YAML failed.');
        return of(null);
      })
    ) as Observable<Record<string, unknown> | null>;
  }
}
