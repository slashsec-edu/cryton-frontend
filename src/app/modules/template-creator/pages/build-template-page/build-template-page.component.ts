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
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import {
  verticalSlideAnimation,
  DEFAULT_SLIDE_DURATION
} from 'src/app/modules/shared/animations/vertical-slide.animation';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { BuildTemplateDisplay } from '../../models/enums/build-template-display.enum';
import { FormGroup } from '@angular/forms';
import { TemplateConverterService } from '../../services/template-converter.service';
import { TemplateService } from 'src/app/services/template.service';
import { AlertService } from 'src/app/services/alert.service';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TemplateCreatorHelpComponent } from '../../components/template-creator-help/template-creator-help.component';
import { TemplateYamlPreviewComponent } from '../../components/template-yaml-preview/template-yaml-preview.component';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-build-template-page',
  templateUrl: './build-template-page.component.html',
  styleUrls: ['./build-template-page.component.scss', '../../models/styles/responsive-height.scss'],
  animations: [verticalSlideAnimation(DEFAULT_SLIDE_DURATION)],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildTemplatePageComponent implements AfterViewInit {
  @ViewChild('depTreePortalContent') depTreePortalContent: TemplateRef<unknown>;
  @ViewChild('timelinePortalContent') timelinePortalContent: TemplateRef<unknown>;

  selectedPortal: Portal<any>;
  depTreePortal: TemplatePortal<any>;
  timelinePortal: TemplatePortal<any>;

  templateDepTreeRef = DepTreeRef.TEMPLATE_CREATION;
  creating$ = new BehaviorSubject(false);

  private _shouldForceShowTemplate = false;

  get templateForm(): FormGroup {
    return this._state.templateForm;
  }

  constructor(
    private _treeManager: DependencyTreeManagerService,
    private _viewContainerRef: ViewContainerRef,
    private _state: TemplateCreatorStateService,
    private _cd: ChangeDetectorRef,
    private _templateConverter: TemplateConverterService,
    private _templateService: TemplateService,
    private _alertService: AlertService,
    private _dialog: MatDialog
  ) {}

  ngAfterViewInit(): void {
    this.depTreePortal = new TemplatePortal(this.depTreePortalContent, this._viewContainerRef);
    this.timelinePortal = new TemplatePortal(this.timelinePortalContent, this._viewContainerRef);

    if (this._state.buildTemplateDisplayedComponent === BuildTemplateDisplay.DEP_TREE) {
      this.selectedPortal = this.depTreePortal;
      this._cd.detectChanges();
    } else if (this._state.buildTemplateDisplayedComponent === BuildTemplateDisplay.TIMELINE) {
      this.selectedPortal = this.timelinePortal;
      this._cd.detectChanges();
    }
  }

  /**
   * Gets vertical slide animation state.
   *
   * @returns Animation state.
   */
  getAnimationState(): string {
    if (
      this._shouldForceShowTemplate ||
      this._state.buildTemplateDisplayedComponent === BuildTemplateDisplay.BUILD_TEMPLATE
    ) {
      return 'not-shifted';
    }
    return 'shifted';
  }

  /**
   * Loads dependency tree component into the portal.
   */
  showDepTree(): void {
    this.selectedPortal = this.depTreePortal;
    this._state.buildTemplateDisplayedComponent = BuildTemplateDisplay.DEP_TREE;
  }

  /**
   * Loads timeline component into the portal.
   */
  showTimeline(): void {
    this.selectedPortal = this.timelinePortal;
    this._state.buildTemplateDisplayedComponent = BuildTemplateDisplay.TIMELINE;
  }

  /**
   * Resets portal and slides back to build template.
   */
  showBuildTemplate(): void {
    this._shouldForceShowTemplate = true;

    setTimeout(() => {
      this.selectedPortal = null;
      this._shouldForceShowTemplate = false;
      this._state.buildTemplateDisplayedComponent = BuildTemplateDisplay.BUILD_TEMPLATE;
    }, DEFAULT_SLIDE_DURATION);
  }

  /**
   * Handles create button click.
   */
  handleCreate(): void {
    if (this.isCreationDisabled()) {
      return this._alertService.showError('Template is invalid.');
    }
    const template = this._templateConverter.exportYAMLTemplate();
    const creationDialog = this._dialog.open(TemplateYamlPreviewComponent, { width: '60%', data: { template } });

    creationDialog
      .afterClosed()
      .pipe(first())
      .subscribe((finalTemplate: string) => {
        if (finalTemplate) {
          this.createTemplate(finalTemplate);
        }
      });
  }

  /**
   * Creates YAML representation of the template and uploads it to the backend.
   */
  createTemplate(templateYAML: string): void {
    this.creating$.next(true);

    this._templateService.uploadYAML(templateYAML).subscribe({
      next: successMsg => {
        this._state.clear();
        this._treeManager.reset();
        this.creating$.next(false);
        this._alertService.showSuccess(successMsg);
      },
      error: errMsg => {
        this.creating$.next(false);
        this._alertService.showError(errMsg);
      }
    });
  }

  /**
   * Gets errors string for template creation.
   *
   * @returns Errors string.
   */
  getCreationErrors(): string {
    const depTree = this._treeManager.getCurrentTree(DepTreeRef.TEMPLATE_CREATION).value;
    const errors: string[] = [];

    if (!this._state.templateForm.valid) {
      errors.push('Invalid template parameters.');
    }

    errors.push(...depTree.errors());

    return errors.map(err => '- ' + err).join('\n');
  }

  /**
   * Decides if tempalte creation is disabled.
   *
   * @returns True if template creation is disabled.
   */
  isCreationDisabled(): boolean {
    const depTree = this._treeManager.getCurrentTree(DepTreeRef.TEMPLATE_CREATION).value;
    if (!this._state.templateForm.valid || !depTree.isValid()) {
      return true;
    }
    return false;
  }

  /**
   * Opens help page.
   */
  openHelp(): void {
    this._dialog.open(TemplateCreatorHelpComponent, { width: '60%' });
  }
}
