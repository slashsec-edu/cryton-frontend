import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { StageCreatorComponent } from '../../../components/stage-creator/stage-creator.component';
import { CreateStageComponent } from '../../../models/enums/create-stage-component.enum';
import { NavigationButton } from '../../../models/interfaces/navigation-button';
import { DepGraphRef } from '../../../services/dependency-graph-manager.service';
import { TCRoute, TcRoutingService } from '../../../services/tc-routing.service';

@Component({
  selector: 'app-create-stage-page',
  templateUrl: './create-stage-page.component.html',
  styleUrls: ['./create-stage-page.component.scss', '../../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateStagePageComponent implements OnInit, OnDestroy {
  @ViewChild(StageCreatorComponent) stageCreator: StageCreatorComponent;
  depGraphRef = DepGraphRef.STAGE_CREATION;
  currentComponent: string = CreateStageComponent.STAGE_PARAMS;
  CreateStageComponent = CreateStageComponent;

  depGraphNavigationBtns: NavigationButton[] = [
    { icon: 'description', name: 'Show stage parameters', componentName: CreateStageComponent.STAGE_PARAMS }
  ];

  private _destroy$ = new Subject<void>();

  constructor(private _tcRouter: TcRoutingService, private _cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    this._tcRouter.route$.pipe(takeUntil(this._destroy$)).subscribe((route: TCRoute) => {
      if (route.stepIndex === 2) {
        this.currentComponent = route.componentName ?? 'stage_params';
        this._cd.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
