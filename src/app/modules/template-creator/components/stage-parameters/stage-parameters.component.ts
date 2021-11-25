import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { getControlError } from './stage-parameters.errors';
import { TriggerType } from '../../models/enums/trigger-type';
import { TriggerFactory } from '../../classes/triggers/trigger-factory';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { StageForm } from '../../classes/stage-creation/forms/stage-form';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StageNode } from '../../classes/dependency-tree/node/stage-node';

@Component({
  selector: 'app-stage-parameters',
  templateUrl: './stage-parameters.component.html',
  styleUrls: ['./stage-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageParametersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(ComponentInputDirective) triggerFormHost: ComponentInputDirective;
  @Input() nodeManager: NodeManager;

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

  triggerTypes = Object.values(TriggerType);
  stageFormGroup: FormGroup;

  private _destroy$ = new Subject<void>();
  private _stageForm: StageForm;
  private _initialized = false;
  private _triggerChangeSub: Subscription;

  get valid(): boolean {
    return this.stageForm.isValid();
  }

  constructor(private _componentFactoryResolver: ComponentFactoryResolver, private _cd: ChangeDetectorRef) {}

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
   * and current stage creation dependency tree.
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

    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(triggerParamsComponent);
    const viewContainerRef = this.triggerFormHost.viewContainerRef;

    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
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
