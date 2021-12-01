import { Component, OnInit } from '@angular/core';
import { RunService } from 'src/app/services/run.service';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { LinkButton } from 'src/app/models/cryton-table/interfaces/link-button.interface';
import { Button } from 'src/app/models/cryton-table/interfaces/button.interface';
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
  buttons: Button<Run>[];
  createButton: LinkButton = { value: 'Create run', link: '/app/runs/create' };

  constructor(private _runService: RunService, private _crytonDatetime: CrytonDatetimePipe, private _router: Router) {}

  ngOnInit(): void {
    this.dataSource = new RunTableDataSource(this._runService, this._crytonDatetime);
    this.buttons = [{ icon: 'assignment', func: this.handleReport }];
  }

  // Buttons functionality
  handleReport = (run: Run): Observable<string> => {
    this._router.navigate(['app', 'reports', run.id]);
    return of(null) as Observable<string>;
  };
}
