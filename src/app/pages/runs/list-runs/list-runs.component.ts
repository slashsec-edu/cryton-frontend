import { Component, OnInit, ViewChild } from '@angular/core';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { RunTableDataSource } from 'src/app/models/data-sources/run-table.data-source';
import { Run } from 'src/app/models/api-responses/run.interface';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { CrytonDatetimePipe } from 'src/app/modules/shared/pipes/cryton-datetime.pipe';
import { RunService } from 'src/app/services/run.service';
import { ExpandedRunManipulationComponent } from 'src/app/modules/shared/components/run-manipulation/expanded-run-manipulation.component';
import { TableButton } from 'src/app/modules/shared/components/cryton-table/buttons/table-button';
import { LinkButton } from 'src/app/modules/shared/components/cryton-table/buttons/link-button';

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
  buttons: TableButton[];

  constructor(private _runService: RunService, private _crytonDatetime: CrytonDatetimePipe) {
    this.buttons = [
      new LinkButton('Show run', 'visibility', '/app/runs/:id'),
      new LinkButton('Show timeline', 'schedule', '/app/runs/:id/timeline'),
      new LinkButton('Show YAML', 'description', '/app/runs/:id/yaml')
    ];
  }

  ngOnInit(): void {
    this.dataSource = new RunTableDataSource(this._runService, this._crytonDatetime);
  }
}
