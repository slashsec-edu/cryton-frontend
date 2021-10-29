import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { Component, Output, EventEmitter, DebugElement, ViewChild, OnInit } from '@angular/core';
import Konva from 'konva';
import { Subject } from 'rxjs';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { CrytonStage } from '../../classes/cryton-node/cryton-stage';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { TabsRouter, Tabs } from '../../classes/utils/tabs-router';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { StageForm } from '../../classes/stage-creation/forms/stage-form';
import { NodeType } from '../../models/enums/node-type';
import { StageParametersComponent } from '../stage-parameters/stage-parameters.component';
import { ThemeService } from 'src/app/services/theme.service';
import { PreviewDependencyTree } from '../../classes/dependency-tree/preview-dependency-tree';
import { TriggerFactory } from '../../classes/cryton-node/triggers/trigger-factory';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-stage-creator',
  templateUrl: './stage-creator.component.html',
  styleUrls: ['./stage-creator.component.scss', '../../models/styles/responsive-height.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageCreatorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('container') canvasContainer: DebugElement;
  @ViewChild(StageParametersComponent) stageParams: StageParametersComponent;
  @Output() swapPages = new EventEmitter<void>();

  previewDepTree: PreviewDependencyTree;
  parentDepTree: DependencyTree;

  private _stageManager: NodeManager;
  private _destroy$ = new Subject<void>();

  get stageForm(): StageForm {
    return this._state.stageForm;
  }
  set stageForm(value: StageForm) {
    this._state.stageForm = value;
  }

  get editedStage(): CrytonStage {
    return this._state.editedStage;
  }
  set editedStage(value: CrytonStage) {
    this._state.editedStage = value;
  }

  constructor(
    private _treeManager: DependencyTreeManagerService,
    private _state: TemplateCreatorStateService,
    private _themeService: ThemeService,
    private _alertService: AlertService,
    private _cd: ChangeDetectorRef
  ) {}

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
    this._createEditSubscription();

    if (this._state.stageFormBackup && !this.editedStage) {
      this.stageForm = this._state.stageFormBackup;
      this._state.stageFormBackup = null;
    }
  }

  ngAfterViewInit(): void {
    this._createUpdatePreviewSubscription();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.previewDepTree.destroy();
  }

  emitSwapPagesEvent(): void {
    this.swapPages.emit();
  }

  /**
   * Creates a preview of stage creation dependency tree inside
   * a container with ID: 'stage-creator--tree-preview'.
   */
  createTreePreview(): void {
    const originalTree: DependencyTree = this._treeManager.getCurrentTree(DepTreeRef.STAGE_CREATION).value;

    this.previewDepTree.initPreview(
      originalTree,
      'stage-creator--tree-preview',
      this.canvasContainer,
      this._themeService.currentTheme$
    );
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
    this._stageManager.moveToDispenser(stage);
    this._resetStageCreator();
  }

  /**
   * Edits stage and cancels editing.
   */
  handleSaveChanges(): void {
    this.stageParams.editStage(this.editedStage);
    this.cancelEditing();
  }

  /**
   * Erases stage parameters form and switches tabs back to build template tab.
   */
  cancelEditing(): void {
    this._stageManager.editNode$.next();
    TabsRouter.selectIndex(Tabs.BUILD_TEMPLATE);
    this.stageForm.ignoredName = null;

    setTimeout(() => {
      this.editedStage = null;
      this.stageForm.erase();
      this._treeManager.restoreTree(DepTreeRef.STAGE_CREATION);
    }, 500);
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

    return !this.areParametersValid() || !stageCreationDepTree.isCorrect();
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
  private _createStage(): CrytonStage {
    const { name, triggerType } = this._state.stageForm.getStageArgs();
    const childDepTree = this._treeManager.getCurrentTree(DepTreeRef.STAGE_CREATION).value;

    const trigger = TriggerFactory.createTrigger(triggerType, this._state.stageForm.getTriggerArgs());

    return new CrytonStage({
      parentDepTree: this.parentDepTree,
      timeline: this._state.timeline,
      childDepTree,
      trigger,
      name
    });
  }

  /**
   * Subscribes to edit node replaySubject in current template creation dependency tree node manager.
   *
   * On every next():
   * - Backs up current contents of template creator.
   * - Loads edited stage into the template creator.
   */
  private _createEditSubscription(): void {
    this._treeManager
      .getCurrentTree(DepTreeRef.TEMPLATE_CREATION)
      .pipe(
        takeUntil(this._destroy$),
        tap(depTree => {
          this.parentDepTree = depTree;
          this._stageManager = depTree.treeNodeManager;
        }),
        mergeMap(depTree => depTree.treeNodeManager.editNode$.pipe(takeUntil(this._destroy$)))
      )
      .subscribe((stage: CrytonStage) => {
        // Fill stage creator only if no stage is currently being
        // edited to prevent erasing progress by switching tabs.
        if (stage) {
          this.stageForm.ignoredName = stage.name;
          this._treeManager.getCurrentTree(DepTreeRef.TEMPLATE_CREATION).value.treeNodeManager.editNode$.next(null);

          // Backup stage creator state so we can load it back after editing is complete.
          if (this.stageForm.isNotEmpty()) {
            this._state.stageFormBackup = this.stageForm.copy();
          }

          this.stageForm.fill(stage);

          this._treeManager.editTree(DepTreeRef.STAGE_CREATION, stage.childDepTree, this.editedStage == null);
          this.editedStage = stage;
        }
      });
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
