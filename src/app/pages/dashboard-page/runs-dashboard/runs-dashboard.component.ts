import { Component, OnInit } from '@angular/core';
import { RunService } from 'src/app/services/run.service';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { LinkButton } from 'src/app/models/cryton-table/interfaces/link-button.interface';
import { RunTableDataSource } from 'src/app/models/data-sources/run-table.data-source';
import { Run } from 'src/app/models/api-responses/run.interface';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-runs-dashboard',
  templateUrl: './runs-dashboard.component.html'
})
export class RunsDashboardComponent implements OnInit {
  dataSource: RunTableDataSource;
  buttons: LinkButton<Run>[];

  constructor(private _runService: RunService, private _crytonDatetime: CrytonDatetimePipe, private _router: Router) {}

  ngOnInit(): void {
    this.dataSource = new RunTableDataSource(this._runService, this._crytonDatetime);
    this.buttons = [
      { name: 'Show run', icon: 'visibility', constructLink: (row: Run) => `/app/runs/${row.id}` },
      { name: 'Show timeline', icon: 'schedule', constructLink: (row: Run) => `/app/runs/${row.id}/timeline` },
      { name: 'Show YAML', icon: 'description', constructLink: (row: Run) => `/app/runs/${row.id}/yaml` }
    ];
  }

  viewRun = (run: Run): Observable<string> => {
    this._router.navigate(['app', 'runs', run.id]);
    return of(null) as Observable<string>;
  };
}
