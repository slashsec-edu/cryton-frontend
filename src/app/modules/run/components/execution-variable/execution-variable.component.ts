import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, of } from 'rxjs';
import { delay, first, switchMapTo } from 'rxjs/operators';
import { ExecutionVariable } from 'src/app/models/api-responses/execution-variable.interface';
import { CertainityCheckComponent } from 'src/app/modules/shared/components/certainity-check/certainity-check.component';
import { AlertService } from 'src/app/services/alert.service';
import { ExecutionVariableService } from 'src/app/services/execution-variable.service';
import { ExecutionVariablePreviewComponent } from '../execution-variable-preview/execution-variable-preview.component';

@Component({
  selector: 'app-execution-variable',
  templateUrl: './execution-variable.component.html',
  styleUrls: ['./execution-variable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExecutionVariableComponent {
  @Input() variable: ExecutionVariable;
  @Output() deleted = new EventEmitter<void>();

  loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _execVarService: ExecutionVariableService,
    private _dialog: MatDialog,
    private _alert: AlertService
  ) {}

  delete(): void {
    const certainityCheck = this._dialog.open(CertainityCheckComponent);

    certainityCheck
      .afterClosed()
      .pipe(first())
      .subscribe(shouldDelete => {
        if (shouldDelete) {
          this._deleteVariable();
        }
      });
  }

  view(): void {
    this._dialog.open(ExecutionVariablePreviewComponent, {
      data: { variable: this.variable },
      width: '700px',
      maxWidth: '50%'
    });
  }

  private _deleteVariable(): void {
    this.loading$.next(true);

    of({})
      .pipe(
        first(),
        delay(200),
        switchMapTo(this._execVarService.deleteItem(this.variable.id).pipe(first(), delay(200)))
      )
      .subscribe({
        next: (msg: string) => {
          this.loading$.next(false);
          this._alert.showSuccess(msg);
          this.deleted.emit();
        },
        error: (err: string) => {
          this.loading$.next(false);
          this._alert.showError(err);
        }
      });
  }
}
