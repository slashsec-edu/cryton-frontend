import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ShortStringPipe } from 'src/app/modules/shared/pipes/short-string.pipe';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { StepEdge } from '../../classes/dependency-graph/edge/step-edge';
import { EdgeCondition } from '../../models/interfaces/edge-condition';

type Option = { value: string; displayName: string };

@Component({
  selector: 'app-edge-parameters',
  templateUrl: './edge-parameters.component.html',
  styleUrls: ['./edge-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeParametersComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();
  conditionsFormGroup = new FormGroup({
    conditions: new FormArray([])
  });

  typeOptions: Option[] = [
    { value: 'state', displayName: 'STATE' },
    { value: 'result', displayName: 'RESULT' },
    { value: 'std_out', displayName: 'STD_OUT' },
    { value: 'std_err', displayName: 'STD_ERR' },
    { value: 'mod_out', displayName: 'MOD_OUT' },
    { value: 'mod_err', displayName: 'MOD_ERR' },
    { value: 'any', displayName: 'ANY' }
  ];

  stateOptions: string[] = ['FINISHED'];
  resultOptions: string[] = ['OK', 'FAIL', 'EXCEPTION'];

  invalidError = 'Invalid conditions.';

  get conditions(): FormArray {
    return this.conditionsFormGroup.get('conditions') as FormArray;
  }

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
    if (this.conditionsFormGroup.valid) {
      this.data.edge.conditions = this.getEdgeConditions();

      this.close();
    } else {
      this._alert.showError('Conditions are invalid.');
    }
  }

  /**
   * Adds new empty condition form group to the conditions array.
   *
   * @param type Type of condition.
   * @returns Condition FormGroup.
   */
  addCondition(type = null): FormGroup {
    const condition = new FormGroup({
      type: new FormControl(type, [Validators.required])
    });

    if (type !== 'any') {
      condition.addControl('valueForm', this._createValueForm(type));
    }

    this.conditions.push(condition);
    return condition;
  }

  /**
   * Removes the given condition from the conditions array.
   *
   * @param index Index of the condition to remove.
   */
  removeCondition(index: number): void {
    if (this.conditions.length > 1) {
      this.conditions.removeAt(index);
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

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  onConditionTypeChange(index: number, type: string): void {
    const condition = this.asFormGroup(this.conditions.at(index));
    const valueForm = this._createValueForm(type);
    const currentValueForm = condition.get('valueForm');

    if (currentValueForm) {
      if (valueForm) {
        condition.setControl('valueForm', valueForm);
      } else {
        condition.removeControl('valueForm');
      }
    } else {
      if (valueForm) {
        condition.addControl('valueForm', valueForm);
      }
    }
  }

  getEdgeConditions(): EdgeCondition[] {
    const conditions = this.conditions.value as Record<string, unknown>[];
    const edgeConditions: EdgeCondition[] = [];

    conditions.forEach(condition => {
      if (condition.type === 'state' || condition.type === 'result') {
        const valueForm = condition.valueForm as { selection: string };
        edgeConditions.push({ type: condition.type, value: valueForm.selection });
      } else if (condition.type === 'any') {
        edgeConditions.push({ type: condition.type });
      } else {
        const valueForm = condition.valueForm as { isRegex: boolean; value: string };
        edgeConditions.push({
          type: condition.type as string,
          value: valueForm.isRegex ? `r'${valueForm.value}'` : valueForm.value
        });
      }
    });

    return edgeConditions;
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
          this.data.edge.depGraph.stage.draw();
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
      const conditionForm = this.addCondition(condition.type);

      if (condition.type === 'state' || condition.type === 'result') {
        conditionForm.get('valueForm').get('selection').setValue(condition.value);
      } else if (condition.type !== 'any') {
        const isRegex = condition.value.startsWith("r'");
        const value = isRegex ? condition.value.slice(2, condition.value.length - 1) : condition.value;
        conditionForm.get('valueForm').setValue({ value, isRegex });
      }
    });

    if (edge.conditions.length === 0) {
      this.addCondition();
    }
  }

  private _createValueForm(type: string): FormGroup {
    switch (type) {
      case 'state':
        return new FormGroup({ selection: new FormControl('FINISHED', [Validators.required]) });
      case 'result':
        return new FormGroup({ selection: new FormControl('OK', [Validators.required]) });
      case 'any':
        return null;
      default:
        return new FormGroup({
          isRegex: new FormControl(false, [Validators.required]),
          value: new FormControl('', [Validators.required])
        });
    }
  }
}
