import {
  Component,
  OnInit,
  Input,
  Type,
  ViewChild,
  ComponentFactoryResolver,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { Selectable } from 'src/app/models/cryton-editor/interfaces/selectable.interface';
import { InputChange } from 'src/app/models/cryton-editor/interfaces/input-change.interface';
import { StepType } from 'src/app/models/cryton-editor/enums/step-type.enum';
import { StepOverviewItem } from 'src/app/models/cryton-editor/interfaces/step-overview-item.interface';
import { trigger, transition, useAnimation } from '@angular/animations';
import { CrytonEditorStepsComponent } from 'src/app/generics/cryton-editor-steps.component';
import { errorShakeAnimation } from 'src/app/modules/shared/animations/error-shake.animation';
import { takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-cryton-editor',
  templateUrl: './cryton-editor.component.html',
  styleUrls: ['./cryton-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [trigger('error', [transition('noError => error', [useAnimation(errorShakeAnimation)])])]
})
export class CrytonEditorComponent implements OnInit, OnDestroy {
  @ViewChild(ComponentInputDirective, { static: true })
  stepsDirective: ComponentInputDirective;
  /**
   * Name of the edited item.
   */
  @Input() itemName: string;

  /**
   * Total number of steps.
   */
  @Input() stepCount: number;

  /**
   * Steps component to be displayed.
   */
  @Input() stepsComponent: Type<CrytonEditorStepsComponent>;

  /**
   * Items of the item creation overview.
   */
  @Input() stepOverviewItems: StepOverviewItem[];

  /**
   * Sets the flex of the steps component container.
   */
  @Input() stepsComponentFlex?: number;

  /**
   * Triggers on item creation.
   */
  @Output() create = new EventEmitter<void>();

  stepOverviewData: BehaviorSubject<Selectable[] | boolean>[] = [];
  errorMessage: string;

  creatingSubject$ = new BehaviorSubject(false);
  eraseSubject$ = new Subject<void>();
  createSubject$ = new Subject<void>();
  errorSubject$ = new BehaviorSubject<boolean>(false);
  currentStep$ = new BehaviorSubject<number>(0);

  private _destroy$ = new Subject<void>();

  constructor(private _componentFactoryResolver: ComponentFactoryResolver, private _alertService: AlertService) {}

  ngOnInit(): void {
    this._loadSteps();
    this._initOverviewData();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Changes current step to step given in argument.
   *
   * @param step Serial number of step.
   */
  changeStep(step: number): void {
    this.errorSubject$.next(false);
    this.currentStep$.next(step);
  }

  /**
   * Updates the step overview data on input change event triggered by steps component.
   *
   * @param inputChange Check event data.
   */
  handleCheck(inputChange: InputChange): void {
    const dataSubject$ = this.stepOverviewData[this.currentStep$.value];

    // Resets error
    this.errorSubject$.next(false);

    if (typeof dataSubject$.value === 'boolean') {
      dataSubject$.next(inputChange.completion);
    } else {
      const hasNoSelectables = !inputChange.selectables || !inputChange.selectables.length;
      dataSubject$.next(hasNoSelectables ? null : inputChange.selectables);
    }
  }

  /**
   * Resets the editor component to initial state.
   */
  eraseProgress(): void {
    this.changeStep(0);
    this.eraseSubject$.next();

    this.stepOverviewItems.forEach((item, i) => {
      const stepData = this.stepOverviewData[i];

      if (item.type === StepType.SELECTABLE) {
        stepData.next(null);
      } else {
        stepData.next(false);
      }
    });
  }

  /**
   * Stops creating display and resets the component to initial state after creation process completes.
   *
   * @param response$ Response of the http post request.
   */
  completeCreation(response$: Observable<string>): void {
    this.creatingSubject$.next(true);

    response$.pipe(takeUntil(this._destroy$)).subscribe({
      next: (successMsg: string) => {
        this.creatingSubject$.next(false);

        if (successMsg) {
          this.eraseProgress();
          this.create.emit();
          this._alertService.showSuccess(successMsg);
        }
      },
      error: (msg: string) => {
        this.creatingSubject$.next(false);
        this.errorSubject$.next(true);
        this._alertService.showError(msg);
      }
    });
  }

  /**
   * Triggers item creation on create button click.
   */
  triggerCreation(): void {
    if (this._checkRequiredData()) {
      this.creatingSubject$.next(true);
      this.createSubject$.next();
    } else {
      this.triggerError('Please fill out all of the neccessary information.');
    }
  }

  /**
   * Resets error and triggers it again.
   */
  triggerError(message: string): void {
    const errorTimeout = 10;

    this.errorSubject$.next(false);
    this.errorMessage = message;
    setTimeout(() => this.errorSubject$.next(true), errorTimeout);
  }

  /**
   * Sorts selectables into ascending order for display.
   *
   * @param selectables Set of checked selectables.
   */
  sortedSelectables(selectables: Selectable[] | boolean): Selectable[] {
    if (typeof selectables === 'boolean') {
      return;
    }
    return Array.from(selectables).sort((a, b) => a.id - b.id);
  }

  /**
   * Creates the steps component, provides inputs and subscribes to outputs.
   */
  private _loadSteps(): void {
    const componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.stepsComponent);
    const componentRef = this.stepsDirective.viewContainerRef.createComponent(componentFactory);
    const componentInstance = componentRef.instance;

    componentInstance.currentStepSubject$ = this.currentStep$;
    componentInstance.eraseEvent$ = this.eraseSubject$.asObservable();
    componentInstance.createEvent$ = this.createSubject$.asObservable();

    componentInstance.inputChange.pipe(takeUntil(this._destroy$)).subscribe(event => this.handleCheck(event));

    componentInstance.create
      .pipe(takeUntil(this._destroy$))
      .subscribe((res: Observable<string>) => this.completeCreation(res));
  }

  /**
   * Checks if all steps are completed.
   */
  private _checkRequiredData(): boolean {
    for (let i = 0; i < this.stepOverviewItems.length; i++) {
      const dataSubject$ = this.stepOverviewData[i];
      const isRequired = this.stepOverviewItems[i].required;

      if (isRequired && !dataSubject$.value) {
        return false;
      }
    }
    return true;
  }

  /**
   * Initializes data for overview items to default values.
   */
  private _initOverviewData(): void {
    this.stepOverviewItems.forEach(item => {
      if (item.type === StepType.COMPLETION) {
        this.stepOverviewData.push(new BehaviorSubject<boolean>(false));
      } else {
        this.stepOverviewData.push(new BehaviorSubject<Selectable[]>(null));
      }
    });
  }
}
