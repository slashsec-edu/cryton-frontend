import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { getControlError } from './step-creator.errors';
import { AlertService } from 'src/app/services/alert.service';
import { StepNode } from '../../classes/dependency-tree/node/step-node';
import { TreeNode } from '../../classes/dependency-tree/node/tree-node';

@Component({
  selector: 'app-step-creator',
  templateUrl: './step-creator.component.html',
  styleUrls: ['./step-creator.component.scss', '../../models/styles/responsive-height.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepCreatorComponent implements OnInit, OnDestroy {
  private _destroy$ = new Subject<void>();
  private _stepManager: NodeManager;
  private _parentDepTree: DependencyTree;

  get stepForm(): FormGroup {
    return this._state.stepForm;
  }
  set stepForm(value: FormGroup) {
    this._state.stepForm = value;
  }

  get editedStep(): StepNode {
    return this._state.editedStep;
  }
  set editedStep(value: StepNode) {
    this._state.editedStep = value;
  }

  constructor(
    private _treeManager: DependencyTreeManagerService,
    private _state: TemplateCreatorStateService,
    private _alertService: AlertService
  ) {}

  ngOnInit(): void {
    this._createDepTreeSub();

    if (!this.editedStep) {
      this._state.restoreStepForm();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Gets error for a given form control.
   *
   * @param controlName Form control name.
   * @returns Form control error.
   */
  getControlError(controlName: string): string {
    return getControlError(this._state.stepForm, controlName);
  }

  /**
   * Creates step and resets step form.
   */
  handleCreateStep(): void {
    if (this.stepForm.valid) {
      const step: StepNode = this._createStep();
      this._stepManager.moveToDispenser(step);
      this.stepForm.reset();
      this._alertService.showSuccess('Step created successfully');
    } else {
      this._alertService.showError('Step form is invalid.');
    }
  }

  /**
   * Resets form and edited step.
   */
  cancelEditing(): void {
    this.editedStep = null;

    if (!this._state.restoreStepForm()) {
      this.stepForm.reset();
    }
  }

  /**
   * Cancels editing and switches tab back to create stage tab.
   */
  handleCancelClick(): void {
    this._stepManager.clearEditNode();
  }

  /**
   * Saves changes to currently edited step and cancels editing.
   */
  handleSaveChanges(): void {
    const { name, attackModule, attackModuleArgs } = this.stepForm.value as Record<string, string>;
    this.editedStep.edit(name, attackModule, attackModuleArgs);
    this._stepManager.clearEditNode();
  }

  /**
   * Gets errors for the create step button's tooltip.
   *
   * @returns Error string.
   */
  getTooltipErrors(): string {
    if (!this.stepForm.valid) {
      return '- Invalid step parameters.';
    }
  }

  /**
   * Initializes editing of the step passed in the argument.
   *
   * @param step Step to edit.
   */
  private _moveToEditor(step: StepNode): void {
    if (step !== this.editedStep) {
      if (!this.editedStep) {
        this._state.backupStepForm();
      }
      this._fillFormWithStepData(step);
      this.editedStep = step;
    }
  }

  /**
   * Fills out form fields with step parameters.
   *
   * @param step Step to fill parameters of.
   */
  private _fillFormWithStepData(step: StepNode): void {
    this.stepForm.setValue({
      name: step.name,
      attackModule: step.attackModule,
      attackModuleArgs: step.attackModuleArgs
    });
  }

  /**
   * Creates new cryton step from parameters in step form.
   *
   * @returns Cryton step.
   */
  private _createStep(): StepNode {
    const formValue = this.stepForm.value as Record<string, string>;
    const { name, attackModule, attackModuleArgs } = formValue;

    return new StepNode(name, attackModule, attackModuleArgs, this._parentDepTree);
  }

  /**
   * Subscribes to stage creation dep. tree subject in manager.
   *
   * On every next():
   * - Saves current dep. tree and node manager to a local variable.
   * - Creates edit node subscription.
   */
  private _createDepTreeSub(): void {
    this._treeManager
      .getCurrentTree(DepTreeRef.STAGE_CREATION)
      .pipe(
        takeUntil(this._destroy$),
        tap(depTree => this._createEditNodeSub(depTree.treeNodeManager.editNode$))
      )
      .subscribe(depTree => {
        this._parentDepTree = depTree;
        this._stepManager = depTree.treeNodeManager;
        this._state.stepForm.get('name').setValidators([Validators.required, this._uniqueNameValidator]);
      });
  }

  private _createEditNodeSub(editNode$: Observable<TreeNode>): void {
    editNode$.pipe(takeUntil(this._destroy$)).subscribe((step: StepNode) => {
      if (step) {
        this._moveToEditor(step);
      } else if (this._state.editedStep) {
        this.cancelEditing();
      }
    });
  }

  /**
   * Form control validator for checking if node name is unique in a given node manager.
   *
   * @param control Abstract form control.
   * @returns Validation errors.
   */
  private _uniqueNameValidator = (control: AbstractControl): ValidationErrors | null =>
    this._parentDepTree.treeNodeManager.isNodeNameUnique(control.value, this.editedStep?.name ?? null)
      ? null
      : { notUnique: true };
}
