import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { InputChange } from '../models/cryton-editor/interfaces/input-change.interface';
import { Selectable } from '../models/cryton-editor/interfaces/selectable.interface';

@Component({ template: '', changeDetection: ChangeDetectionStrategy.OnPush })
export abstract class CrytonEditorStepsComponent implements OnInit, OnDestroy {
  @Input() currentStepSubject$: BehaviorSubject<number>;
  @Input() eraseEvent$: Observable<void>;
  @Input() createEvent$: Observable<void>;

  @Output() inputChange = new EventEmitter<InputChange>();
  @Output() create = new EventEmitter<Observable<string>>();

  protected destroySubject$ = new Subject<void>();

  constructor() {}

  /**
   * Subscribes to createEvent observable and triggers post request creation.
   */
  ngOnInit(): void {
    this.createEvent$.pipe(takeUntil(this.destroySubject$)).subscribe(() => this.createPostRequest());
    this.eraseEvent$.pipe(takeUntil(this.destroySubject$)).subscribe(() => this.erase());
  }

  /**
   * Properly unsubscribes from observables.
   */
  ngOnDestroy(): void {
    this.destroySubject$.next();
    this.destroySubject$.complete();
  }

  /**
   * Says if a given step should be hidden.
   *
   * @param index Index of a step.
   */
  isHidden(index: number): boolean {
    return this.currentStepSubject$.value !== index;
  }

  /**
   * Emits an InputChange event with info about items selected in step.
   *
   * @param selectables Array of strings with information about selectable items.
   */
  emitSelectables(selectables: Selectable[]): void {
    const change: InputChange = {
      selectables,
      completion: false
    };
    this.inputChange.emit(change);
  }

  /**
   * Emits an InputChange event with info about completion of step.
   *
   * @param completion True if step is completed.
   */
  emitCompletion(completion: boolean): void {
    const change: InputChange = {
      selectables: null,
      completion
    };
    this.inputChange.emit(change);
  }

  /**
   * Abstract method used for creating body of a POST request at the time of item creation.
   *
   * @param data Array of subjects which specify if all steps are complete.
   */
  protected abstract createPostRequest(): void;

  /**
   * Abstract method used for erasing creation progress.
   */
  protected abstract erase(): void;
}
