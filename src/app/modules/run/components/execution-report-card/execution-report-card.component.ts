import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { first, pluck, concatAll, filter, toArray, delay, catchError, switchMapTo } from 'rxjs/operators';
import { CrytonRESTApiService } from 'src/app/generics/cryton-rest-api-service';
import { ExecutionVariable } from 'src/app/models/api-responses/execution-variable.interface';
import { PlanExecutionReport } from 'src/app/models/api-responses/report/plan-execution-report.interface';
import { CrytonRESTApiEndpoint } from 'src/app/models/enums/cryton-rest-api-endpoint.enum';
import { AlertService } from 'src/app/services/alert.service';
import { ExecutionVariableService } from 'src/app/services/execution-variable.service';

@Component({
  selector: 'app-execution-report-card',
  templateUrl: './execution-report-card.component.html',
  styleUrls: ['../../styles/report.scss', './execution-report-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutionReportCardComponent implements OnInit {
  get execution(): PlanExecutionReport {
    return this._execution;
  }
  @Input() set execution(value: PlanExecutionReport) {
    this._execution = value;
    this.loadVariables();
  }

  variables: ExecutionVariable[] = [];
  loading$ = new BehaviorSubject<boolean>(false);
  initialized = false;

  private _execution: PlanExecutionReport;

  constructor(private _variableService: ExecutionVariableService, private _alert: AlertService) {}

  ngOnInit(): void {}

  loadVariables(): void {
    const executionEndpoint =
      CrytonRESTApiService.buildEndpointURL(CrytonRESTApiEndpoint.PLAN_EXECUTIONS, 'v1') + `/${this.execution.id}/`;
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
        catchError(() => throwError('Loading execution variables failed.'))
      )
      .subscribe({
        next: vars => {
          this.variables = vars;
          this.initialized = true;
          this.loading$.next(false);
        },
        error: err => {
          this.loading$.next(false);
          this._alert.showError(err);
        }
      });
  }

  removeVariable(variable: ExecutionVariable): void {
    const index = this.variables.indexOf(variable);

    if (index !== -1) {
      this.variables.splice(index, 1);
    }
  }

  trackByFn(_: number, item: ExecutionVariable): number {
    return item.id;
  }
}
