import { EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { first, mergeMap, switchMap } from 'rxjs/operators';
import { HasID } from 'src/app/models/cryton-table/interfaces/has-id.interface';
import { PostponeRunComponent } from 'src/app/modules/run/components/postpone-run/postpone-run.component';
import { CertainityCheckComponent } from 'src/app/modules/shared/components/certainity-check/certainity-check.component';
import { CrytonDatetimePickerComponent } from 'src/app/modules/shared/components/cryton-datetime-picker/cryton-datetime-picker.component';
import { AlertService } from 'src/app/services/alert.service';
import { RunService } from 'src/app/services/run.service';
import { ExpandedRowInterface } from '../../../../generics/expanded-row.interface';

type RunState = 'PENDING' | 'SCHEDULED' | 'RUNNING' | 'FINISHED' | 'PAUSED' | 'PAUSING' | 'TERMINATED';

type RunActionFunc = () => Observable<string>;

enum RunAction {
  EXECUTE,
  PAUSE,
  UNPAUSE,
  SCHEDULE,
  UNSCHEDULE,
  RESCHEDULE,
  POSTPONE,
  KILL
}

interface Button {
  id: number;
  value: string;
  icon: string;
  activeStates: RunState[];
  action: RunAction;
}

interface HasIDAndState extends HasID {
  state: string;
}

export abstract class RunManipulationComponent<T extends HasIDAndState> implements ExpandedRowInterface<T> {
  rowData: T;
  delete = new EventEmitter<void>();
  rowUpdate = new EventEmitter<T>();

  loadingSubject$ = new BehaviorSubject(false);

  executionButtons: Button[] = [
    {
      id: 1,
      value: 'Execute run',
      icon: 'play_circle_filled',
      activeStates: ['PENDING'],
      action: RunAction.EXECUTE
    },
    {
      id: 2,
      value: 'Pause run',
      icon: 'pause_circle_filled',
      activeStates: ['RUNNING'],
      action: RunAction.PAUSE
    },
    {
      id: 3,
      value: 'Unpause run',
      icon: 'pause_circle_outline',
      activeStates: ['PAUSED'],
      action: RunAction.UNPAUSE
    },
    {
      id: 4,
      value: 'Kill run',
      icon: 'not_interested',
      activeStates: ['RUNNING'],
      action: RunAction.KILL
    }
  ];

  schedulingButtons: Button[] = [
    { id: 1, value: 'Schedule run', icon: 'today', activeStates: ['PENDING'], action: RunAction.SCHEDULE },
    { id: 2, value: 'Reschedule run', icon: 'today', activeStates: ['SCHEDULED'], action: RunAction.RESCHEDULE },
    { id: 3, value: 'Postpone run', icon: 'more_time', activeStates: ['SCHEDULED'], action: RunAction.POSTPONE },
    { id: 4, value: 'Unschedule run', icon: 'event_busy', activeStates: ['SCHEDULED'], action: RunAction.UNSCHEDULE }
  ];

  constructor(protected _runService: RunService, protected _dialog: MatDialog, protected _alertService: AlertService) {}

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
      case RunAction.KILL:
        return this.executeRunAction(() => this._runService.killRun(this.rowData.id));
      case RunAction.POSTPONE:
        return this.postponeRun();
      default:
        throw new Error('Tried to execute unknown run action.');
    }
  }

  /**
   * Opens a dialog window to check if user really wants to delete a run.
   * Deletes the run if user confirms.
   */
  deleteRun(): void {
    const dialogRef = this._dialog.open(CertainityCheckComponent);
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
        error: (err: Error) => {
          this.loadingSubject$.next(false);
          this._alertService.showError(err.message);
        }
      });
  }

  /**
   * Opens a dialog with the cryton datetime picker.
   * Schedules run if user picks a correct date and time.
   */
  scheduleRun(shouldReschedule: boolean): void {
    const dialogRef = this._dialog.open(CrytonDatetimePickerComponent, {
      width: '380px',
      data: { blockPastDates: true }
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
        error: (err: Error) => {
          this.loadingSubject$.next(false);
          this._alertService.showError(err.message);
        }
      });
  }

  postponeRun(): void {
    const postponer = this._dialog.open(PostponeRunComponent);

    postponer
      .afterClosed()
      .pipe(
        first(),
        switchMap(delta => {
          if (delta) {
            this.loadingSubject$.next(true);
            return this._runService.postponeRun(this.rowData.id, delta);
          }
          return of(null);
        })
      )
      .subscribe({
        next: msg => {
          if (msg) {
            this.loadingSubject$.next(false);
            this._updateRowData();
            this._alertService.showSuccess(msg);
          }
        },
        error: (err: Error) => {
          this.loadingSubject$.next(false);
          this._alertService.showError(err.message);
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
        error: (err: Error) => {
          this.loadingSubject$.next(false);
          this._alertService.showError(err.message);
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
    return buttons.filter(btn => btn.activeStates.includes(this.rowData.state.toUpperCase() as RunState));
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

  protected abstract _updateRowData(): void;
}
