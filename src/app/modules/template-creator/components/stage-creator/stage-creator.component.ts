import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { Component, Output, EventEmitter, DebugElement, ViewChild, OnInit } from '@angular/core';
import Konva from 'konva';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { StageForm } from '../../classes/stage-creation/forms/stage-form';
import { NodeType } from '../../models/enums/node-type';
import { StageParametersComponent } from '../stage-parameters/stage-parameters.component';
import { ThemeService } from 'src/app/services/theme.service';
import { PreviewDependencyTree } from '../../classes/dependency-tree/preview-dependency-tree';
import { TriggerFactory } from '../../classes/triggers/trigger-factory';
import { AlertService } from 'src/app/services/alert.service';
import { StageNode } from '../../classes/dependency-tree/node/stage-node';
import { MatDialog } from '@angular/material/dialog';
import { StageCreatorHelpComponent } from '../../pages/help-pages/stage-creator-help/stage-creator-help.component';
import { CreateStageComponent } from '../../models/enums/create-stage-component.enum';
import { TcRoutingService } from '../../services/tc-routing.service';

@Component({
  selector: 'app-stage-creator',
  templateUrl: './stage-creator.component.html',
  styleUrls: ['./stage-creator.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageCreatorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('container') canvasContainer: DebugElement;
  @ViewChild(StageParametersComponent) stageParams: StageParametersComponent;
  @Output() navigate = new EventEmitter<string>();

  previewDepTree: PreviewDependencyTree;
  parentDepTree: DependencyTree;
  CreateStageComponent = CreateStageComponent;
  showCreationMessage$: Observable<boolean>;

  private _stageManager: NodeManager;
  private _destroy$ = new Subject<void>();
  private _showCreationMessage$ = new BehaviorSubject<boolean>(false);

  get stageForm(): StageForm {
    return this._state.stageForm;
  }
  set stageForm(value: StageForm) {
    this._state.stageForm = value;
  }

  get editedStage(): StageNode {
    return this._state.editedStage;
  }
  set editedStage(value: StageNode) {
    this._state.editedStage = value;
  }

  constructor(
    private _treeManager: DependencyTreeManagerService,
    private _state: TemplateCreatorStateService,
    private _themeService: ThemeService,
    private _alertService: AlertService,
    private _cd: ChangeDetectorRef,
    private _dialog: MatDialog,
    private _tcRouter: TcRoutingService
  ) {
    this.showCreationMessage$ = this._showCreationMessage$.asObservable();
  }

  /**
   * Resizes canvas on window resize
   */
  @HostListener('window:resize') onResize(): void {
    this.previewDepTree.updateDimensions();
    this.previewDepTree.fitScreen();
  }

  ngOnInit(): void {
    if (!this.stageForm) {
      this.stageForm = this._createStageForm();
    }
    this.previewDepTree = new PreviewDependencyTree(NodeType.CRYTON_STEP);
    this._createDepTreeSub();
    this._createEditNodeSub();

    if (!this.editedStage) {
      this._state.restoreStageForm();
    }
  }

  ngAfterViewInit(): void {
    this._createUpdatePreviewSubscription();
    this._cd.detectChanges();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.previewDepTree.destroy();
  }

  /**
   * Opens help page.
   */
  openHelp(): void {
    this._dialog.open(StageCreatorHelpComponent, { width: '60%' });
  }

  /**
   * Creates a preview of stage creation dependency tree inside
   * a container with ID: 'stage-creator--tree-preview'.
   */
  createTreePreview(): void {
    const originalTree: DependencyTree = this._treeManager.getCurrentTree(DepTreeRef.STAGE_CREATION).value;

    this.previewDepTree.initPreview(originalTree, this.canvasContainer.nativeElement, this._themeService.currentTheme$);
    this.previewDepTree.fitScreen();
    this.previewDepTree.stage.listening(false);
  }

  /**
   * Creates a stage and resets the stage creator to the default settings.
   */
  handleCreateStage(): void {
    if (this.isCreationDisabled()) {
      return this._alertService.showError('Stage is invalid.');
    }

    const stage = this._createStage();
    this._treeManager.addDispenserNode(DepTreeRef.TEMPLATE_CREATION, stage);
    this._resetStageCreator();
    this._showCreationMessage$.next(true);
    setTimeout(() => this._showCreationMessage$.next(false), 5000);
  }

  /**
   * Saves changes to currently edited stage and cancels editing.
   */
  handleSaveChanges(): void {
    this.stageParams.editStage(this.editedStage);

    const childDepTree = this._treeManager.getCurrentTree(DepTreeRef.STAGE_CREATION).value;
    this.editedStage.editChildDepTree(childDepTree);
    this._stageManager.clearEditNode();
    this._treeManager.refreshDispenser(DepTreeRef.TEMPLATE_CREATION);
  }

  /**
   * Switches tabs back to build template tab and erases stage parameters form after the tabs finish switching.
   */
  handleCancelClick(): void {
    this._stageManager.clearEditNode();
  }

  /**
   * Clears stage form and edited stage info.
   * Restores previous state from backup.
   */
  cancelEditing(): void {
    this.editedStage = null;
    if (!this._state.restoreStageForm()) {
      this.stageForm.cancelEditing();
    }
    this._treeManager.restoreTree(DepTreeRef.STAGE_CREATION);
  }

  /**
   * Checks if stage creation should be disabled.
   * Disabled if:
   * - Invalid stage parameters
   * - Invalid dependency tree
   *
   * @returns True if creation is disabled.
   */
  isCreationDisabled(): boolean {
    const stageCreationDepTree = this._treeManager.getCurrentTree(DepTreeRef.STAGE_CREATION).value;

    return !this.areParametersValid() || !stageCreationDepTree.isValid();
  }

  /**
   * Checks if stage parameters are valid based on stage form group validators.
   *
   * @returns True if stage parameters are valid.
   */
  areParametersValid(): boolean {
    return this.stageForm?.isValid() ?? false;
  }

  /**
   * Gets formatted errors string for stage creation.
   *
   * @returns Errors string.
   */
  getCreationErrors(): string {
    const stageCreationDepTree = this._treeManager.getCurrentTree(DepTreeRef.STAGE_CREATION).value;
    const errors = stageCreationDepTree.errors();

    if (!this._state.stageForm.isValid()) {
      errors.push('Invalid stage parameters.');
    }

    return errors.map(err => '- ' + err).join('\n');
  }

  /**
   * Calls change detector.
   *
   * Used for detecting a change in create button's disabled state
   * after user makes changes in a dependency tree and slides back to the stage creator.
   * Without this the button would stay disabled even without errors.
   */
  detectChanges(): void {
    this._cd.detectChanges();
  }

  eraseParameters(): void {
    this.stageForm.erase();
  }

  navigateToTemplatesDepTree(): void {
    this._tcRouter.navigateTo(3, CreateStageComponent.DEP_TREE);
  }

  /**
   * Creates new stage form with current node manager.
   *
   * @returns Stage form.
   */
  private _createStageForm(): StageForm {
    const nodeManager = this._treeManager.getCurrentTree(DepTreeRef.TEMPLATE_CREATION).value.treeNodeManager;
    return new StageForm(nodeManager);
  }

  /**
   * Erases stage form and resets current tree to default settings.
   */
  private _resetStageCreator(): void {
    this.stageForm.erase();
    this._treeManager.resetCurrentTree(DepTreeRef.STAGE_CREATION);
  }

  /**
   * Creates stage with parameters from stage form and stage creation
   * dependency tree as a child dependency tree.
   *
   * @returns Created cryton stage.
   */
  private _createStage(): StageNode {
    const { name, triggerType } = this._state.stageForm.getStageArgs();
    const childDepTree = this._treeManager.getCurrentTree(DepTreeRef.STAGE_CREATION).value;

    const trigger = TriggerFactory.createTrigger(triggerType, this._state.stageForm.getTriggerArgs());

    return new StageNode({
      parentDepTree: this.parentDepTree,
      timeline: this._state.timeline,
      childDepTree,
      trigger,
      name
    });
  }

  /**
   * Subscribes to template creation dep. tree subject in manager.
   *
   * On every next():
   * - Saves current dep. tree and node manager to a local variable.
   * - Creates edit node subscription.
   */
  private _createDepTreeSub(): void {
    this._treeManager
      .getCurrentTree(DepTreeRef.TEMPLATE_CREATION)
      .pipe(takeUntil(this._destroy$))
      .subscribe(depTree => {
        this.parentDepTree = depTree;
        this._stageManager = depTree.treeNodeManager;
      });
  }

  /**
   * Subscribes to currently edited node and handles editing initialization and cancelling.
   *
   * @param editNode$ Edit node observable from tree manager.
   */
  private _createEditNodeSub(): void {
    this._treeManager
      .observeNodeEdit(DepTreeRef.TEMPLATE_CREATION)
      .pipe(takeUntil(this._destroy$))
      .subscribe((stage: StageNode) => {
        if (stage) {
          this._moveToEditor(stage);
        } else if (this.editedStage) {
          this.cancelEditing();
        }
      });
  }

  /**
   * Initializes editing of the stage passed in the argument.
   *
   * @param stage Stage to edit.
   */
  private _moveToEditor(stage: StageNode): void {
    if (stage !== this.editedStage) {
      // Don't back up empty form or edited stage.
      if (!this.editedStage) {
        this._state.backupStageForm();
        this.stageForm = this._createStageForm();
      }
      this.stageForm.fillWithEditedStage(stage);

      this._treeManager.editTree(DepTreeRef.STAGE_CREATION, stage.childDepTree, this.editedStage == null);
      this.editedStage = stage;
      this._cd.detectChanges();
    }
  }

  /**
   * Subscribes to stage creation dependency tree subject.
   *
   * On every next:
   * - Creates tree preview if tree isn't empty.
   * - Erases tree preview if tree is empty.
   */
  private _createUpdatePreviewSubscription(): void {
    this._treeManager
      .getCurrentTree(DepTreeRef.STAGE_CREATION)
      .pipe(takeUntil(this._destroy$))
      .subscribe(depTree => {
        if (depTree.treeLayer && depTree.treeLayer.children.length > 0) {
          this.createTreePreview();
        } else if (this.previewDepTree.stage) {
          this._eraseTreePreview();
        }
      });
  }

  /**
   * Erases tree preview's layer.
   */
  private _eraseTreePreview(): void {
    this.previewDepTree.removeChildren();
    this.previewDepTree.treeLayer = new Konva.Layer();
    this.previewDepTree.treeLayer.draw();
  }
}
