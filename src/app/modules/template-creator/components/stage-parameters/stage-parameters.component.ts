import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { NodeManager } from '../../classes/dependency-graph/node-manager';
import { StageNode } from '../../classes/dependency-graph/node/stage-node';
import { StageForm } from '../../classes/stage-creation/forms/stage-form';
import { TriggerFactory } from '../../classes/triggers/trigger-factory';
import { getControlError } from './stage-parameters.errors';

type Option = { value: string; name: string };

@Component({
  selector: 'app-stage-parameters',
  templateUrl: './stage-parameters.component.html',
  styleUrls: ['./stage-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageParametersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(ComponentInputDirective) triggerFormHost: ComponentInputDirective;
  @Input() nodeManager: NodeManager;

  triggerTypeOpts: Option[] = [
    { value: 'delta', name: 'Delta' },
    { value: 'HTTPListener', name: 'HTTPListener' },
    { value: 'datetime', name: 'DateTime' }
  ];
  stageFormGroup: FormGroup;

  private _destroy$ = new Subject<void>();
  private _stageForm: StageForm;
  private _initialized = false;
  private _triggerChangeSub: Subscription;

  constructor(private _cd: ChangeDetectorRef) {}

  get valid(): boolean {
    return this.stageForm.isValid();
  }

  get stageForm(): StageForm {
    return this._stageForm;
  }

  @Input() set stageForm(value: StageForm) {
    if (value) {
      this._stageForm = value;
    } else {
      this._stageForm = new StageForm(this.nodeManager);
    }

    this.stageFormGroup = this.stageForm.getStageArgsForm();

    if (this._initialized) {
      this.renderTrigger();
      this._createTriggerChangeSub(value);
    }
  }

  ngOnInit(): void {
    if (!this.stageForm) {
      this.stageForm = new StageForm(this.nodeManager);
    }
    this.stageFormGroup = this.stageForm.getStageArgsForm();
  }

  ngAfterViewInit(): void {
    this.renderTrigger();
    this._createTriggerChangeSub(this.stageForm);
    this._initialized = true;
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  setEditedNodeName(name: string): void {
    this.stageForm.editedNodeName = name;
  }

  fillFromStage(stage: StageNode): void {
    this.stageForm.fill(stage);
  }

  /**
   * Gets from control error message.
   *
   * @param controlName Form control name.
   * @param formGroup Form group which control belongs to.
   * @returns Current error message.
   */
  getControlError(controlName: string, formGroup: FormGroup): string {
    return getControlError(formGroup, controlName);
  }

  /**
   * Edits stage passed in an argument with stage form parameters
   * and current stage creation dependency graph.
   *
   * @param stage Stage to edit.
   */
  editStage(stage: StageNode): void {
    const { name, triggerType } = this.stageForm.getStageArgs();
    const trigger = TriggerFactory.createTrigger(triggerType, this.stageForm.getTriggerArgs());

    try {
      stage.editTrigger(trigger);
      stage.updateTimelineNode();
      stage.editName(name);
    } catch (e) {
      throw e;
    }
  }

  renderTrigger(): void {
    const triggerParamsComponent = this.stageForm.getTriggerFormComponent();
    const viewContainerRef = this.triggerFormHost.viewContainerRef;

    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(triggerParamsComponent);
    const componentInstance = componentRef.instance;

    componentInstance.triggerForm = this.stageForm.getTriggerForm();
    this._cd.detectChanges();
  }

  private _createTriggerChangeSub(stageForm: StageForm): void {
    if (this._triggerChangeSub) {
      this._triggerChangeSub.unsubscribe();
    }

    this._triggerChangeSub = stageForm.triggerTypeChange$
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.renderTrigger());
  }
}
