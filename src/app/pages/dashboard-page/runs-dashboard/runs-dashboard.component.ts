import { Component, OnInit } from '@angular/core';
import { RunService } from 'src/app/services/run.service';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { RunTableDataSource } from 'src/app/models/data-sources/run-table.data-source';
import { Run } from 'src/app/models/api-responses/run.interface';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { TableButton } from 'src/app/modules/shared/components/cryton-table/buttons/table-button';
import { LinkButton } from 'src/app/modules/shared/components/cryton-table/buttons/link-button';

@Component({
  selector: 'app-runs-dashboard',
  templateUrl: './runs-dashboard.component.html'
})
export class RunsDashboardComponent implements OnInit {
  dataSource: RunTableDataSource;
  buttons: TableButton[];

  constructor(private _runService: RunService, private _crytonDatetime: CrytonDatetimePipe, private _router: Router) {}

  ngOnInit(): void {
    this.dataSource = new RunTableDataSource(this._runService, this._crytonDatetime);
    this.buttons = [
      new LinkButton('Show run', 'visibility', '/app/runs/:id'),
      new LinkButton('Show timeline', 'schedule', '/app/runs/:id/timeline'),
      new LinkButton('Show YAML', 'description', '/app/runs/:id/yaml')
    ];
  }

  viewRun = (run: Run): Observable<string> => {
    this._router.navigate(['app', 'runs', run.id]);
    return of(null) as Observable<string>;
  };
}
