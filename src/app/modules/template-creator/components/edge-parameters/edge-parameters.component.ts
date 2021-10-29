import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { ShortStringPipe } from 'src/app/modules/shared/pipes/short-string.pipe';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EdgeCondition } from '../../models/interfaces/edge-condition';
import { CrytonStepEdge } from '../../classes/cryton-edge/cryton-step-edge';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-edge-parameters',
  templateUrl: './edge-parameters.component.html',
  styleUrls: ['./edge-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EdgeParametersComponent implements OnInit, OnDestroy {
  destroy$ = new Subject<void>();

  conditions: FormGroup[] = [];

  constructor(
    private _dialogRef: MatDialogRef<EdgeParametersComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { edge: CrytonStepEdge }
  ) {}

  ngOnInit(): void {
    this._loadEdgeConditions();
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
    this.data.edge.conditions = this.conditions.map(condition => condition.value as EdgeCondition);
    this.close();
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
    const conditionIndex = this.conditions.indexOf(condition);
    if (conditionIndex !== -1) {
      this.conditions.splice(conditionIndex, 1);
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
   */
  private _loadEdgeConditions(): void {
    this.data.edge.conditions.forEach(condition => {
      this.conditions.push(
        new FormGroup({
          type: new FormControl(condition.type, Validators.required),
          value: new FormControl(condition.value, Validators.required)
        })
      );
    });

    if (this.data.edge.conditions.length === 0) {
      this.conditions.push(
        new FormGroup({
          type: new FormControl('', [Validators.required]),
          value: new FormControl('', [Validators.required])
        })
      );
    }
  }
}
