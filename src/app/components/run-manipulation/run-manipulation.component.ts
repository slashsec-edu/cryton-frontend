import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { ExpandedRowInterface } from '../../generics/expanded-row.interface';
import { Run } from 'src/app/models/api-responses/run.interface';
import { RunService } from 'src/app/services/run.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CrytonDatetimePickerComponent } from 'src/app/modules/shared/components/cryton-datetime-picker/cryton-datetime-picker.component';
import { MatDialog } from '@angular/material/dialog';
import { mergeMap, first } from 'rxjs/operators';
import { CertainityCheckComponent } from 'src/app/modules/shared/components/certainity-check/certainity-check.component';
import { AlertService } from 'src/app/services/alert.service';

type RunState = 'PENDING' | 'SCHEDULED' | 'RUNNING' | 'FINISHED' | 'PAUSED' | 'PAUSING' | 'TERMINATED';

type RunActionFunc = () => Observable<string>;

enum RunAction {
  EXECUTE,
  PAUSE,
  UNPAUSE,
  SCHEDULE,
  UNSCHEDULE,
  RESCHEDULE
}

interface Button {
  id: number;
  value: string;
  icon: string;
  activeState: RunState;
  action: RunAction;
}

@Component({
  selector: 'app-run-manipulation',
  templateUrl: './run-manipulation.component.html',
  styleUrls: ['./run-manipulation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunManipulationComponent implements OnInit, ExpandedRowInterface<Run> {
  @Input() rowData: Run;
  @Output() delete = new EventEmitter<void>();
  @Output() rowUpdate = new EventEmitter<Run>();

  loadingSubject$ = new BehaviorSubject(false);

  executionButtons: Button[] = [
    {
      id: 1,
      value: 'Execute run',
      icon: 'play_circle_filled',
      activeState: 'PENDING',
      action: RunAction.EXECUTE
    },
    {
      id: 2,
      value: 'Pause run',
      icon: 'pause_circle_filled',
      activeState: 'RUNNING',
      action: RunAction.PAUSE
    },
    {
      id: 3,
      value: 'Unpause run',
      icon: 'pause_circle_outline',
      activeState: 'PAUSED',
      action: RunAction.UNPAUSE
    }
  ];

  schedulingButtons: Button[] = [
    { id: 1, value: 'Schedule run', icon: 'today', activeState: 'PENDING', action: RunAction.SCHEDULE },
    { id: 2, value: 'Reschedule run', icon: 'today', activeState: 'SCHEDULED', action: RunAction.RESCHEDULE },
    { id: 3, value: 'Unschedule run', icon: 'event_busy', activeState: 'SCHEDULED', action: RunAction.UNSCHEDULE }
  ];

  constructor(
    private _runService: RunService,
    public dialog: MatDialog,
    private _alertService: AlertService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  /**
   * Handles execution of correct button action after button click.
   *
   * @param button Button object.
   */
  handleButtonClick(button: Button): void {
    switch (button.action) {
      case RunAction.SCHEDULE:
        return this.scheduleRun(false);
      case RunAction.RESCHEDULE:
        return this.scheduleRun(true);
      case RunAction.EXECUTE:
        return this.executeRunAction(() => this._runService.executeRun(this.rowData.id));
      case RunAction.PAUSE:
        return this.executeRunAction(() => this._runService.pauseRun(this.rowData.id));
      case RunAction.UNPAUSE:
        return this.executeRunAction(() => this._runService.unpauseRun(this.rowData.id));
      case RunAction.UNSCHEDULE:
        return this.executeRunAction(() => this._runService.unscheduleRun(this.rowData.id));
      default:
        throw new Error('Tried to execute unknown run action.');
    }
  }

  /**
   * Opens a dialog window to check if user really wants to delete a run.
   * Deletes the run if user confirms.
   */
  deleteRun(): void {
    const dialogRef = this.dialog.open(CertainityCheckComponent);
    dialogRef
      .afterClosed()
      .pipe(
        mergeMap(result => {
          if (result) {
            this.loadingSubject$.next(true);
            return this._runService.deleteItem(this.rowData.id);
          }
          return of(null);
        }),
        first()
      )
      .subscribe({
        next: (successMsg: string) => {
          this.loadingSubject$.next(false);
          if (successMsg) {
            this.delete.emit();
            this._alertService.showSuccess(successMsg);
          }
        },
        error: err => {
          this.loadingSubject$.next(false);
          this._alertService.showError(err);
        }
      });
  }

  /**
   * Opens a dialog with the cryton datetime picker.
   * Schedules run if user picks a correct date and time.
   */
  scheduleRun(shouldReschedule: boolean): void {
    const dialogRef = this.dialog.open(CrytonDatetimePickerComponent, {
      panelClass: 'app-no-padding-dialog'
    });

    dialogRef
      .afterClosed()
      .pipe(
        mergeMap((result: Date) => {
          if (result) {
            this.loadingSubject$.next(true);

            if (shouldReschedule) {
              return this._runService.rescheduleRun(result, this.rowData.id);
            } else {
              return this._runService.scheduleRun(result, this.rowData.id);
            }
          }
          return of(null);
        }),
        first()
      )
      .subscribe({
        next: successMsg => {
          if (successMsg) {
            this.loadingSubject$.next(false);
            this._updateRowData();
            this._alertService.showSuccess(successMsg);
          }
        },
        error: err => {
          this.loadingSubject$.next(false);
          this._alertService.showError(err);
        }
      });
  }

  /**
   * Executes run action and handles loading and alert messaging.
   *
   * @param actionFunc Run action function to be executed.
   */
  executeRunAction(actionFunc: RunActionFunc): void {
    this.loadingSubject$.next(true);

    actionFunc()
      .pipe(first())
      .subscribe({
        next: successMsg => {
          this.loadingSubject$.next(false);
          this._updateRowData();
          this._alertService.showSuccess(successMsg);
        },
        error: err => {
          this.loadingSubject$.next(false);
          this._alertService.showError(err);
        }
      });
  }

  /**
   * Filters buttons which are active according to current run state.
   *
   * @param buttons Buttons to filter.
   * @returns Filtered buttons.
   */
  filterActiveButtons(buttons: Button[]): Button[] {
    return buttons.filter(btn => btn.activeState === this.rowData.state);
  }

  /**
   * Tracking function for ngFor structural directive.
   *
   * @param item Button object.
   * @returns Button ID.
   */
  trackByID(_: number, item: Button): number {
    return item.id;
  }

  /**
   * Fetches updated row data from the api and replaces current data with it.
   */
  private _updateRowData(): void {
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
