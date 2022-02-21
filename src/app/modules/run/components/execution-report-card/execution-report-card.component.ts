import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { catchError, concatAll, delay, filter, first, pluck, switchMap, switchMapTo, toArray } from 'rxjs/operators';
import { CrytonRESTApiService } from 'src/app/generics/cryton-rest-api-service';
import { ExecutionVariable } from 'src/app/models/api-responses/execution-variable.interface';
import { PlanExecutionReport } from 'src/app/models/api-responses/report/plan-execution-report.interface';
import { Endpoint } from 'src/app/models/enums/endpoint.enum';
import { CrytonInventoryCreatorComponent } from 'src/app/modules/shared/components/cryton-inventory-creator/cryton-inventory-creator.component';
import { AlertService } from 'src/app/services/alert.service';
import { ExecutionVariableService } from 'src/app/services/execution-variable.service';

@Component({
  selector: 'app-execution-report-card',
  templateUrl: './execution-report-card.component.html',
  styleUrls: ['../../styles/report.scss', './execution-report-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutionReportCardComponent {
  // Array of loaded execution variables.
  variables: ExecutionVariable[] = [];

  // Emits true if the component is currently making an asynchronous request.
  loading$ = new BehaviorSubject<boolean>(false);

  // Says if the first variable load had already happened.
  initialized = false;

  private _execution: PlanExecutionReport;

  constructor(
    private _variableService: ExecutionVariableService,
    private _alert: AlertService,
    private _dialog: MatDialog
  ) {}

  get execution(): PlanExecutionReport {
    return this._execution;
  }

  @Input() set execution(value: PlanExecutionReport) {
    this._execution = value;
    this.loadVariables();
  }

  createVariables(): void {
    const variableDialog = this._dialog.open(CrytonInventoryCreatorComponent);

    variableDialog
      .afterClosed()
      .pipe(
        first(),
        filter((yaml: string) => {
          if (yaml) {
            return true;
          }
        }),
        switchMap((yaml: string) => {
          this.loading$.next(true);
          return this._variableService.postItem({ plan_execution_id: this.execution.id, inventory_file: yaml });
        })
      )
      .subscribe({
        next: () => {
          this.loadVariables();
          this._alert.showSuccess('Variables uploaded successfully.');
        },
        error: () => {
          this.loading$.next(false);
          this._alert.showError('Failed to upload variables.');
        }
      });
  }

  /**
   * Loads execution variables from the backend. Handles loading observable emission and alert emission.
   */
  loadVariables(): void {
    const executionEndpoint =
      CrytonRESTApiService.buildEndpointURL(Endpoint.PLAN_EXECUTIONS, 'v1') + `/${this.execution.id}/`;
    this.loading$.next(true);

    of({})
      .pipe(
        delay(200),
        first(),
        switchMapTo(
          this._variableService.fetchItems().pipe(
            first(),
            pluck('data'),
            concatAll(),
            filter((variable: ExecutionVariable) => variable.plan_execution === executionEndpoint),
            toArray()
          )
        ),
        catchError(() => throwError(() => new Error('Loading execution variables failed.')))
      )
      .subscribe({
        next: (vars: ExecutionVariable[]) => {
          this.variables = vars;
          this.initialized = true;
          this.loading$.next(false);
        },
        error: (err: string) => {
          this.loading$.next(false);
          this._alert.showError(err);
        }
      });
  }

  /**
   * Removes a variable from the variables array.
   *
   * @param variable Variable to be removed.
   */
  removeVariable(variable: ExecutionVariable): void {
    const index = this.variables.indexOf(variable);

    if (index !== -1) {
      this.variables.splice(index, 1);
    }
  }

  /**
   * Tracking function for *ngFor directive.
   *
   * @param _ Item index (not needed).
   * @param item Tracked item
   * @returns Unique dentifier.
   */
  trackByFn(_: number, item: ExecutionVariable): number {
    return item.id;
  }
}
