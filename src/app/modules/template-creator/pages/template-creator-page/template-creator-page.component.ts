import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TCRoute, TcRoutingService } from '../../services/tc-routing.service';

@Component({
  selector: 'app-template-creator-page',
  templateUrl: './template-creator-page.component.html',
  styleUrls: ['./template-creator-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateCreatorPageComponent implements OnInit, OnDestroy {
  @ViewChild(MatStepper) stepper: MatStepper;
  private _destroy$ = new Subject<void>();

  constructor(private _tcRouter: TcRoutingService) {}

  ngOnInit(): void {
    this._tcRouter.route$.pipe(takeUntil(this._destroy$)).subscribe((route: TCRoute) => {
      this.stepper.selectedIndex = route.stepIndex;
      this.stepChanged(this.stepper);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  /**
   * Used to prevent unwanted triggering errors on previously visited steps.
   *
   * @param stepper MatStepper component.
   */
  stepChanged(stepper: MatStepper): void {
    stepper.selected.interacted = false;
  }
}
