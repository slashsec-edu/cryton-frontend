import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CrytonStep } from '../../classes/cryton-node/cryton-step';
import { Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { TabsRouter, Tabs } from '../../classes/utils/tabs-router';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { getControlError } from './step-creator.errors';

@Component({
  selector: 'app-step-creator',
  templateUrl: './step-creator.component.html',
  styleUrls: ['./step-creator.component.scss', '../../models/styles/responsive-height.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepCreatorComponent implements OnInit, OnDestroy {
  isEditingModeOn = false;

  private _destroy$ = new Subject<void>();
  private _stepManager: NodeManager;
  private _parentDepTree: DependencyTree;

  get stepForm(): FormGroup {
    return this._state.stepParametersFormGroup;
  }

  get editedStep(): CrytonStep {
    return this._state.editedStep;
  }
  set editedStep(value: CrytonStep) {
    this._state.editedStep = value;
  }

  constructor(private _treeManager: DependencyTreeManagerService, private _state: TemplateCreatorStateService) {}

  ngOnInit(): void {
    this._createTreeSub();
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
    return getControlError(this._state.stepParametersFormGroup, controlName);
  }

  /**
   * Creates step and resets step form.
   */
  handleCreateStep(): void {
    const step: CrytonStep = this._createStep();
    this._stepManager.moveToDispenser(step);
    this.stepForm.reset();
  }

  /**
   * Resets step form and switches tab back to create stage tab.
   */
  cancelEditing(): void {
    this._stepManager.editNode$.next();
    TabsRouter.selectIndex(Tabs.CREATE_STAGE);

    setTimeout(() => {
      this.isEditingModeOn = false;
      this.editedStep = null;
      this.stepForm.reset();
    }, 500);
  }

  /**
   * Edits currently edited step.
   */
  editStep(): void {
    const { name, attackModule, attackModuleArgs } = this.stepForm.value as Record<string, string>;
    this.editedStep.edit(name, attackModule, attackModuleArgs);
    this.editedStep.treeNode.draw();

    this.cancelEditing();
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
   * Initializes editing of the step passed in argument.
   *
   * @param step Step to edit.
   */
  private _moveToEditor(step: CrytonStep): void {
    if (step) {
      this.editedStep = step;
      this.isEditingModeOn = true;
      this._fillFormWithStepData(step);
    }
  }

  /**
   * Fills out form fields with step parameters.
   *
   * @param step Step to fill parameters of.
   */
  private _fillFormWithStepData(step: CrytonStep): void {
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
  private _createStep(): CrytonStep {
    const formValue = this.stepForm.value as Record<string, string>;
    const { name, attackModule, attackModuleArgs } = formValue;

    return new CrytonStep(name, attackModule, attackModuleArgs, this._parentDepTree);
  }

  /**
   *
   * Taps into current stage creation dependency tree subject.
   * - Saves current tree.
   * - Initializes unique name validator.
   *
   * Subscribes to edit node subject.
   *
   * On every next():
   * - Fills step form with edited step data.
   */
  private _createTreeSub(): void {
    this._treeManager
      .getCurrentTree(DepTreeRef.STAGE_CREATION)
      .pipe(
        takeUntil(this._destroy$),
        tap(depTree => {
          this._parentDepTree = depTree;
          this._stepManager = depTree.treeNodeManager;
          this._state.stepParametersFormGroup
            .get('name')
            .setValidators([Validators.required, this._uniqueNameValidator]);
        }),
        switchMap(depTree => depTree.treeNodeManager.editNode$)
      )
      .subscribe((step: CrytonStep) => {
        this._moveToEditor(step);
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
