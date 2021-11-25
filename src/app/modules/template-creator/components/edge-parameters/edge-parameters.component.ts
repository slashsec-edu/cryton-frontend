import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ShortStringPipe } from 'src/app/modules/shared/pipes/short-string.pipe';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EdgeCondition } from '../../models/interfaces/edge-condition';
import { first } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { StepEdge } from '../../classes/dependency-tree/edge/step-edge';

@Component({
  selector: 'app-edge-parameters',
  templateUrl: './edge-parameters.component.html',
  styleUrls: ['./edge-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeParametersComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  conditions: FormGroup[] = [];

  typeOptions: { type: string; display: string }[] = [
    { type: 'return_code', display: 'RETURN_CODE' },
    { type: 'state', display: 'STATE' },
    { type: 'result', display: 'RESULT' },
    { type: 'std_out', display: 'STD_OUT' },
    { type: 'std_err', display: 'STD_ERR' },
    { type: 'mod_out', display: 'MOD_OUT' },
    { type: 'mod_err', display: 'MOD_ERR' },
    { type: 'any', display: 'ANY' }
  ];

  invalidError = 'Invalid conditions.';

  constructor(
    private _alert: AlertService,
    private _dialogRef: MatDialogRef<EdgeParametersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { edge: StepEdge }
  ) {}

  ngOnInit(): void {
    this._loadEdgeConditions(this.data.edge);
    this._createAfterClosedSub();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Closes the dialog window.
   */
  close(): void {
    this._dialogRef.close();
  }

  /**
   * Saves edge data and closes the dialog window.
   */
  saveEdge(): void {
    if (this.isValid()) {
      this.data.edge.conditions = this.conditions.map(condition => condition.value as EdgeCondition);
      this.close();
    } else {
      this._alert.showError('Conditions are invalid.');
    }
  }

  /**
   * Adds new empty condition form group to the conditions array.
   */
  addCondition(): void {
    this.conditions.push(
      new FormGroup({
        type: new FormControl('', [Validators.required]),
        value: new FormControl('', [Validators.required])
      })
    );
  }

  /**
   * Removes the given condition from the conditions array.
   *
   * @param condition Condition to remove.
   */
  removeCondition(condition: FormGroup): void {
    if (this.conditions.length > 1) {
      const conditionIndex = this.conditions.indexOf(condition);
      if (conditionIndex !== -1) {
        this.conditions.splice(conditionIndex, 1);
      }
    } else {
      this._alert.showError('Step edge must contain at least 1 condition.');
    }
  }

  /**
   * Gets edge's parent node name.
   *
   * @returns Parent node name.
   */
  getParentName(): string {
    const name = this.data.edge?.parentNode.name ?? '';
    return new ShortStringPipe().transform(name, 10);
  }

  /**
   * Gets edge's child node name.
   *
   * @returns Child node name.
   */
  getChildName(): string {
    const name = this.data.edge?.childNode.name ?? '';
    return new ShortStringPipe().transform(name, 10);
  }

  /**
   * Checks if every condition is valid.
   *
   * @returns True if every condition is valid.
   */
  isValid(): boolean {
    return this.conditions.every(condition => condition.valid);
  }

  /**
   * Subscribes to the dialog reference's afterClosed observable
   * for destroying an invalid edge (edge with 0 conditions) after closing.
   */
  private _createAfterClosedSub(): void {
    this._dialogRef
      .afterClosed()
      .pipe(first())
      .subscribe(() => {
        if (this.data.edge.conditions.length === 0) {
          this.data.edge.destroy();
          this.data.edge.depTree.stage.draw();
        }
      });
  }

  /**
   * Loads all edge conditions and fills the form fields with them.
   * At least one condition form group must be always present.
   *
   * @param edge Step edge from MAT_DIALOG_DATA.
   */
  private _loadEdgeConditions(edge: StepEdge): void {
    edge.conditions.forEach(condition => {
      this.conditions.push(
        new FormGroup({
          type: new FormControl(condition.type, Validators.required),
          value: new FormControl(condition.value, Validators.required)
        })
      );
    });

    if (edge.conditions.length === 0) {
      this.conditions.push(
        new FormGroup({
          type: new FormControl('', [Validators.required]),
          value: new FormControl('', [Validators.required])
        })
      );
    }
  }
}
