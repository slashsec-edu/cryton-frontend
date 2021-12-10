import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { Run } from 'src/app/models/api-responses/run.interface';
import { AlertService } from 'src/app/services/alert.service';
import { RunService } from 'src/app/services/run.service';
import { RunManipulationComponent } from './run-manipulation.component';

@Component({
  selector: 'app-expanded-run-manipulation',
  templateUrl: './run-manipulation.component.html',
  styleUrls: ['./run-manipulation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandedRunManipulationComponent extends RunManipulationComponent<Run> {
  @Input() rowData: Run;

  constructor(
    protected _runService: RunService,
    protected _dialog: MatDialog,
    protected _alertService: AlertService,
    private _cd: ChangeDetectorRef
  ) {
    super(_runService, _dialog, _alertService);
  }

  /**
   * Fetches updated row data from the api and replaces current data with it.
   */
  protected _updateRowData(): void {
    this._runService
      .fetchItem(this.rowData.id)
      .pipe(first())
      .subscribe((row: Run) => {
        this.rowUpdate.emit(row);
        this.rowData = row;
        this._cd.detectChanges();
      });
  }
}
