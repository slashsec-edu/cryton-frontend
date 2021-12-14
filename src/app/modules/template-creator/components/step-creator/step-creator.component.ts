import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { getControlError } from './step-creator.errors';
import { AlertService } from 'src/app/services/alert.service';
import { StepNode } from '../../classes/dependency-tree/node/step-node';
import { MatDialog } from '@angular/material/dialog';
import { StepCreatorHelpComponent } from '../../pages/help-pages/step-creator-help/step-creator-help.component';
import { TcRoutingService } from '../../services/tc-routing.service';
import { CreateStageComponent } from '../../models/enums/create-stage-component.enum';

export const CREATION_MSG_TIMEOUT = 7000;

@Component({
  selector: 'app-step-creator',
  templateUrl: './step-creator.component.html',
  styleUrls: ['./step-creator.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepCreatorComponent implements OnInit, OnDestroy {
  stepForm = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    attackModule: new FormControl(null, [Validators.required]),
    attackModuleArgs: new FormControl(null, [Validators.required])
  });
  editedStep: StepNode;
  showCreationMessage$: Observable<boolean>;

  private _destroy$ = new Subject<void>();
  private _stepManager: NodeManager;
  private _parentDepTree: DependencyTree;
  private _stepFormValueBackup: Record<string, string>;
  private _showCreationMessage$ = new BehaviorSubject<boolean>(false);

  constructor(
    private _treeManager: DependencyTreeManagerService,
    private _alertService: AlertService,
    private _dialog: MatDialog,
    private _tcRouter: TcRoutingService
  ) {
    this.showCreationMessage$ = this._showCreationMessage$.asObservable();
  }

  ngOnInit(): void {
    this._createDepTreeSub();
    this._createEditNodeSub();
    this._createCreationMsgSub();

    if (!this.editedStep) {
      this.restoreStepForm();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Opens help page.
   */
  openHelp(): void {
    this._dialog.open(StepCreatorHelpComponent, { width: '60%' });
  }

  /**
   * Gets error for a given form control.
   *
   * @param controlName Form control name.
   * @returns Form control error.
   */
  getControlError(controlName: string): string {
    return getControlError(this.stepForm, controlName);
  }

  /**
   * Creates step and resets step form.
   */
  handleCreateStep(): void {
    if (this.stepForm.valid) {
      const step: StepNode = this._createStep();
      this.stepForm.reset();
      this._alertService.showSuccess('Step created successfully');
      this._treeManager.addDispenserNode(DepTreeRef.STAGE_CREATION, step);

      this._showCreationMessage$.next(true);
    } else {
      this._alertService.showError('Step form is invalid.');
    }
  }

  /**
   * Resets form and edited step.
   */
  cancelEditing(): void {
    this.editedStep = null;

    if (!this.restoreStepForm()) {
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

    // Needed to update displayed parameters in dispenser.
    this._treeManager.refreshDispenser(DepTreeRef.STAGE_CREATION);
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
   * Backs up step form.
   */
  backupStepForm(): void {
    this._stepFormValueBackup = JSON.parse(JSON.stringify(this.stepForm.value)) as Record<string, string>;
  }

  /**
   * Restores step form from backup, returns true if there was a backed up form value.
   */
  restoreStepForm(): boolean {
    if (this._stepFormValueBackup) {
      this.stepForm.setValue(this._stepFormValueBackup);
      this.stepForm.markAsUntouched();
      this._stepFormValueBackup = null;
      return true;
    }
    return false;
  }

  navigateToStagesDepTree(): void {
    this._tcRouter.navigateTo(2, CreateStageComponent.DEP_TREE);
  }

  /**
   * Initializes editing of the step passed in the argument.
   *
   * @param step Step to edit.
   */
  private _startEditing(step: StepNode): void {
    if (step !== this.editedStep) {
      if (!this.editedStep) {
        this.backupStepForm();
      }
      this._fillFormWithStepData(step);
      this.editedStep = step;

      // Reset unique name validator so that it ignores edited node name.
      const nameControl = this.stepForm.get('name');

      if (this._parentDepTree) {
        nameControl.clearValidators();
        nameControl.setValidators([Validators.required, this._uniqueNameValidator]);
        nameControl.updateValueAndValidity();
      }
    }
  }

  /**
   * Fills out form fields with step parameters.
   *
   * @param step Step to fill parameters of.
   */
  private _fillFormWithStepData(step: StepNode): void {
    this.stepForm.reset();
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

    return new StepNode(name, attackModule, attackModuleArgs);
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
      .pipe(takeUntil(this._destroy$))
      .subscribe(depTree => {
        this._parentDepTree = depTree;
        this._stepManager = depTree.treeNodeManager;
        this.stepForm.get('name').setValidators([Validators.required, this._uniqueNameValidator]);
      });
  }

  private _createEditNodeSub(): void {
    this._treeManager
      .observeNodeEdit(DepTreeRef.STAGE_CREATION)
      .pipe(takeUntil(this._destroy$))
      .subscribe((step: StepNode) => {
        if (step) {
          this._startEditing(step);
        } else if (this.editedStep) {
          this.cancelEditing();
        }
      });
  }

  private _createCreationMsgSub(): void {
    this._showCreationMessage$
      .pipe(
        takeUntil(this._destroy$),
        filter(val => val),
        debounceTime(CREATION_MSG_TIMEOUT)
      )
      .subscribe(() => this._showCreationMessage$.next(false));
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
