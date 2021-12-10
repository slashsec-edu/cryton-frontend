import { Component, OnInit, ViewChild } from '@angular/core';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { RunManipulationComponent } from 'src/app/modules/shared/components/run-manipulation/run-manipulation.component';
import { RunTableDataSource } from 'src/app/models/data-sources/run-table.data-source';
import { Run } from 'src/app/models/api-responses/run.interface';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { RunService } from 'src/app/services/run.service';
import { Button } from 'src/app/models/cryton-table/interfaces/button.interface';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ExpandedRunManipulationComponent } from 'src/app/modules/shared/components/run-manipulation/expanded-run-manipulation.component';

@Component({
  selector: 'app-list-runs',
  templateUrl: './list-runs.component.html',
  styleUrls: ['./list-runs.component.scss'],
  animations: [renderComponentTrigger]
})
export class ListRunsComponent implements OnInit {
  @ViewChild(CrytonTableComponent) runsTable: CrytonTableComponent<Run>;

  dataSource: RunTableDataSource;
  expandedComponent = ExpandedRunManipulationComponent;
  buttons: Button<Run>[];

  constructor(private _runService: RunService, private _crytonDatetime: CrytonDatetimePipe, private _router: Router) {
    this.buttons = [{ name: 'Show run', icon: 'visibility', func: this.viewRun }];
  }

  ngOnInit(): void {
    this.dataSource = new RunTableDataSource(this._runService, this._crytonDatetime);
  }

  viewRun = (run: Run): Observable<string> => {
    this._router.navigate(['app', 'runs', run.id]);
    return of(null) as Observable<string>;
  };
}
