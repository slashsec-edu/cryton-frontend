import {
  AfterViewInit,
  ChangeDetectionStrategy,
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
import { CrytonStage } from '../../classes/cryton-node/cryton-stage';
import { TriggerFactory } from '../../classes/cryton-node/triggers/trigger-factory';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { StageForm } from '../../classes/stage-creation/forms/stage-form';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-stage-parameters',
  templateUrl: './stage-parameters.component.html',
  styleUrls: ['./stage-parameters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StageParametersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(ComponentInputDirective) triggerFormHost: ComponentInputDirective;
  @Input() nodeManager: NodeManager;
  @Input() stageForm: StageForm;

  triggerTypes = Object.values(TriggerType);
  stageFormGroup: FormGroup;

  private _destroy$ = new Subject<void>();

  get valid(): boolean {
    return this.stageForm.isValid();
  }

  constructor(private _componentFactoryResolver: ComponentFactoryResolver) {}

  ngOnInit(): void {
    if (!this.stageForm) {
      this.stageForm = new StageForm(this.nodeManager);
    }
    this.stageFormGroup = this.stageForm.getStageArgsForm();
  }

  ngAfterViewInit(): void {
    this.renderTrigger();
    this.stageForm.triggerTypeChange$.pipe(takeUntil(this._destroy$)).subscribe(() => this.renderTrigger());
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  ignoreName(name: string): void {
    this.stageForm.ignoredName = name;
  }

  fillFromStage(stage: CrytonStage): void {
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
  editStage(stage: CrytonStage): void {
    const { name, triggerType } = this.stageForm.getStageArgs();
    const trigger = TriggerFactory.createTrigger(triggerType, this.stageForm.getTriggerArgs());

    try {
      stage.timelineNode.checkTriggerStart(trigger.getStartTime());
      stage.name = name;

      try {
        stage.editTrigger(trigger);
        stage.updateTimelineNode();
      } catch (e) {
        throw e;
      }
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
  }
}
