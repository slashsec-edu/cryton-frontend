import { Portal, TemplatePortal } from '@angular/cdk/portal';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  TemplateRef,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {
  verticalSlideAnimation,
  DEFAULT_SLIDE_DURATION
} from 'src/app/modules/shared/animations/vertical-slide.animation';
import { StageCreatorComponent } from '../../components/stage-creator/stage-creator.component';
import { DepTreeRef } from '../../services/dependency-tree-manager.service';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';

@Component({
  selector: 'app-create-stage-page',
  templateUrl: './create-stage-page.component.html',
  styleUrls: ['./create-stage-page.component.scss', '../../models/styles/responsive-height.scss'],
  animations: [verticalSlideAnimation()],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateStagePageComponent implements AfterViewInit {
  @ViewChild('depTreePortalContent') depTreePortalContent: TemplateRef<unknown>;
  @ViewChild(StageCreatorComponent) stageCreator: StageCreatorComponent;

  selectedPortal: Portal<any>;
  depTreePortal: TemplatePortal<any>;
  depTreeRef = DepTreeRef.STAGE_CREATION;

  private _shouldForceShowStage = false;

  constructor(
    private _viewContainerRef: ViewContainerRef,
    private _state: TemplateCreatorStateService,
    private _cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.depTreePortal = new TemplatePortal(this.depTreePortalContent, this._viewContainerRef);

    if (this._state.isDependencyTreeDisplayed) {
      this.selectedPortal = this.depTreePortal;
      this._cd.detectChanges();
    }
  }

  /**
   * Gets vertical slide animation state.
   *
   * @returns Animation state.
   */
  getAnimationState(): string {
    if (this._shouldForceShowStage || !this._state.isDependencyTreeDisplayed) {
      return 'not-shifted';
    }
    return 'shifted';
  }

  /**
   * Resets portal and slides back to stage creation page.
   */
  showStageCreation(): void {
    this.stageCreator.createTreePreview();
    this._shouldForceShowStage = true;

    setTimeout(() => {
      this.selectedPortal = null;
      this._shouldForceShowStage = false;
      this._state.isDependencyTreeDisplayed = false;
    }, DEFAULT_SLIDE_DURATION);
  }

  /**
   * Loads dependency tree component into the portal.
   */
  showDepTree(): void {
    this.selectedPortal = this.depTreePortal;
    this._state.isDependencyTreeDisplayed = true;
  }
}
