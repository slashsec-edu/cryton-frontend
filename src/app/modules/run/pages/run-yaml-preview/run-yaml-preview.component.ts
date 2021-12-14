import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { first, map, pluck, switchMap } from 'rxjs/operators';
import { RunService } from 'src/app/services/run.service';

@Component({
  selector: 'app-run-yaml-preview',
  templateUrl: './run-yaml-preview.component.html',
  styleUrls: ['./run-yaml-preview.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunYamlPreviewComponent implements OnInit {
  runYaml$: Observable<Record<string, unknown>>;
  runID: number;

  constructor(private _route: ActivatedRoute, private _runService: RunService) {}

  ngOnInit(): void {
    this.runYaml$ = this._route.params.pipe(
      first(),
      switchMap((params: Params) => {
        this.runID = Number(params['id']);
        return this._runService.fetchYaml(this.runID);
      }),
      pluck('detail', 'plan'),
      map(yaml => ({ plan: yaml }))
    ) as Observable<Record<string, unknown>>;
  }
}
