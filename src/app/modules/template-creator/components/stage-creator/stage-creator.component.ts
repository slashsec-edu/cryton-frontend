import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, OnDestroy } from '@angular/core';
import { Component, Output, EventEmitter, DebugElement, ViewChild, OnInit } from '@angular/core';
import Konva from 'konva';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import { DependencyGraph } from '../../classes/dependency-graph/dependency-graph';
import { NodeManager } from '../../classes/dependency-graph/node-manager';
import { DependencyGraphManagerService, DepGraphRef } from '../../services/dependency-graph-manager.service';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { StageForm } from '../../classes/stage-creation/forms/stage-form';
import { NodeType } from '../../models/enums/node-type';
import { StageParametersComponent } from '../stage-parameters/stage-parameters.component';
import { ThemeService } from 'src/app/services/theme.service';
import { DependencyGraphPreview } from '../../classes/dependency-graph/dependency-graph-preview';
import { TriggerFactory } from '../../classes/triggers/trigger-factory';
import { AlertService } from 'src/app/services/alert.service';
import { StageNode } from '../../classes/dependency-graph/node/stage-node';
import { MatDialog } from '@angular/material/dialog';
import { StageCreatorHelpComponent } from '../../pages/help-pages/stage-creator-help/stage-creator-help.component';
import { CreateStageComponent } from '../../models/enums/create-stage-component.enum';
import { TcRoutingService } from '../../services/tc-routing.service';

export const CREATION_MSG_TIMEOUT = 7000;

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

  depGraphPreview: DependencyGraphPreview;
  parentDepGraph: DependencyGraph;
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
    private _graphManager: DependencyGraphManagerService,
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
    this.depGraphPreview.updateDimensions();
    this.depGraphPreview.fitScreen();
  }

  ngOnInit(): void {
    if (!this.stageForm) {
      this.stageForm = this._createStageForm();
    }
    this.depGraphPreview = new DependencyGraphPreview(NodeType.CRYTON_STEP);
    this._createDepGraphSub();
    this._createEditNodeSub();
    this._createCreationMsgSub();

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
    this.depGraphPreview.destroy();
  }

  /**
   * Opens help page.
   */
  openHelp(): void {
    this._dialog.open(StageCreatorHelpComponent, { width: '60%' });
  }

  /**
   * Creates a preview of stage creation dependency graph inside
   * a container with ID: 'stage-creator--graph-preview'.
   */
  createGraphPreview(): void {
    const originalGraph: DependencyGraph = this._graphManager.getCurrentGraph(DepGraphRef.STAGE_CREATION).value;

    this.depGraphPreview.initPreview(
      originalGraph,
      this.canvasContainer.nativeElement,
      this._themeService.currentTheme$
    );
    this.depGraphPreview.fitScreen();
    this.depGraphPreview.stage.listening(false);
  }

  /**
   * Creates a stage and resets the stage creator to the default settings.
   */
  handleCreateStage(): void {
    if (this.isCreationDisabled()) {
      return this._alertService.showError('Stage is invalid.');
    }

    const stage = this._createStage();
    this._graphManager.addDispenserNode(DepGraphRef.TEMPLATE_CREATION, stage);
    this._resetStageCreator();
    this._showCreationMessage$.next(true);
  }

  /**
   * Saves changes to currently edited stage and cancels editing.
   */
  handleSaveChanges(): void {
    this.stageParams.editStage(this.editedStage);

    const childDepGraph = this._graphManager.getCurrentGraph(DepGraphRef.STAGE_CREATION).value;
    this.editedStage.editChildDepGraph(childDepGraph);
    this._stageManager.clearEditNode();
    this._graphManager.refreshDispenser(DepGraphRef.TEMPLATE_CREATION);
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
    this._graphManager.restoreGraph(DepGraphRef.STAGE_CREATION);
  }

  /**
   * Checks if stage creation should be disabled.
   * Disabled if:
   * - Invalid stage parameters
   * - Invalid dependency graph
   *
   * @returns True if creation is disabled.
   */
  isCreationDisabled(): boolean {
    const stageCreationDepGraph = this._graphManager.getCurrentGraph(DepGraphRef.STAGE_CREATION).value;

    return !this.areParametersValid() || !stageCreationDepGraph.isValid();
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
    const stageCreationDepGraph = this._graphManager.getCurrentGraph(DepGraphRef.STAGE_CREATION).value;
    const errors = stageCreationDepGraph.errors();

    if (!this._state.stageForm.isValid()) {
      errors.push('Invalid stage parameters.');
    }

    return errors.map(err => '- ' + err).join('\n');
  }

  /**
   * Calls change detector.
   *
   * Used for detecting a change in create button's disabled state
   * after user makes changes in a dependency graph and slides back to the stage creator.
   * Without this the button would stay disabled even without errors.
   */
  detectChanges(): void {
    this._cd.detectChanges();
  }

  eraseParameters(): void {
    this.stageForm.erase();
  }

  navigateToTemplatesDepGraph(): void {
    this._tcRouter.navigateTo(3, CreateStageComponent.DEP_GRAPH);
  }

  /**
   * Creates new stage form with current node manager.
   *
   * @returns Stage form.
   */
  private _createStageForm(): StageForm {
    const nodeManager = this._graphManager.getCurrentGraph(DepGraphRef.TEMPLATE_CREATION).value.graphNodeManager;
    return new StageForm(nodeManager);
  }

  /**
   * Erases stage form and resets current graph to default settings.
   */
  private _resetStageCreator(): void {
    this.stageForm.erase();
    this._graphManager.resetCurrentGraph(DepGraphRef.STAGE_CREATION);
  }

  /**
   * Creates stage with parameters from stage form and stage creation
   * dependency graph as a child dependency graph.
   *
   * @returns Created cryton stage.
   */
  private _createStage(): StageNode {
    const { name, triggerType } = this._state.stageForm.getStageArgs();
    const childDepGraph = this._graphManager.getCurrentGraph(DepGraphRef.STAGE_CREATION).value;
    const trigger = TriggerFactory.createTrigger(triggerType, this._state.stageForm.getTriggerArgs());

    return new StageNode({
      timeline: this._state.timeline,
      childDepGraph,
      trigger,
      name
    });
  }

  /**
   * Subscribes to template creation dep. graph subject in manager.
   *
   * On every next():
   * - Saves current dep. graph and node manager to a local variable.
   * - Creates edit node subscription.
   */
  private _createDepGraphSub(): void {
    this._graphManager
      .getCurrentGraph(DepGraphRef.TEMPLATE_CREATION)
      .pipe(takeUntil(this._destroy$))
      .subscribe(depGraph => {
        this.parentDepGraph = depGraph;
        this._stageManager = depGraph.graphNodeManager;
      });
  }

  /**
   * Subscribes to currently edited node and handles editing initialization and cancelling.
   *
   * @param editNode$ Edit node observable from graph manager.
   */
  private _createEditNodeSub(): void {
    this._graphManager
      .observeNodeEdit(DepGraphRef.TEMPLATE_CREATION)
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

      this._graphManager.editGraph(DepGraphRef.STAGE_CREATION, stage.childDepGraph, this.editedStage == null);
      this.editedStage = stage;
      this._cd.detectChanges();
    }
  }

  /**
   * Subscribes to stage creation dependency graph subject.
   *
   * On every next:
   * - Creates graph preview if graph isn't empty.
   * - Erases graph preview if graph is empty.
   */
  private _createUpdatePreviewSubscription(): void {
    this._graphManager
      .getCurrentGraph(DepGraphRef.STAGE_CREATION)
      .pipe(takeUntil(this._destroy$))
      .subscribe(depGraph => {
        if (depGraph.graphLayer && depGraph.graphLayer.children.length > 0) {
          this.createGraphPreview();
        } else if (this.depGraphPreview.stage) {
          this._eraseGraphPreview();
        }
      });
  }

  /**
   * Erases graph preview's layer.
   */
  private _eraseGraphPreview(): void {
    this.depGraphPreview.removeChildren();
    this.depGraphPreview.graphLayer = new Konva.Layer();
    this.depGraphPreview.graphLayer.draw();
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
}
