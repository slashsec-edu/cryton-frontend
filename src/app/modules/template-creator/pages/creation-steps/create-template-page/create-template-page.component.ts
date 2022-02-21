import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import { AlertService } from 'src/app/services/alert.service';
import { TemplateService } from 'src/app/services/template.service';
import { TemplateYamlPreviewComponent } from '../../../components/template-yaml-preview/template-yaml-preview.component';
import { NavigationButton } from '../../../models/interfaces/navigation-button';
import { DependencyGraphManagerService, DepGraphRef } from '../../../services/dependency-graph-manager.service';
import { TCRoute, TcRoutingService } from '../../../services/tc-routing.service';
import { TemplateConverterService } from '../../../services/template-converter.service';
import { TemplateCreatorStateService } from '../../../services/template-creator-state.service';
import { TemplateCreatorHelpComponent } from '../../help-pages/template-creator-help/template-creator-help.component';

@Component({
  selector: 'app-create-template-page',
  templateUrl: './create-template-page.component.html',
  styleUrls: ['./create-template-page.component.scss', '../../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTemplatePageComponent implements OnInit, OnDestroy {
  templateDepGraphRef = DepGraphRef.TEMPLATE_CREATION;
  creating$ = new BehaviorSubject(false);

  currentComponent = 'template_params';

  // Navigation buttons
  depGraphNavigationBtns: NavigationButton[] = [
    { icon: 'description', name: 'Show template parameters', componentName: 'template_params' },
    { icon: 'schedule', name: 'Show timeline', componentName: 'timeline' }
  ];

  timelineNavigationBtns: NavigationButton[] = [
    { icon: 'description', name: 'Show template parameters', componentName: 'template_params' },
    { icon: 'account_tree', name: 'Show dependency graph', componentName: 'dep_graph' }
  ];

  private _destroy$ = new Subject<void>();

  constructor(
    private _graphManager: DependencyGraphManagerService,
    private _state: TemplateCreatorStateService,
    private _templateConverter: TemplateConverterService,
    private _templateService: TemplateService,
    private _alertService: AlertService,
    private _dialog: MatDialog,
    private _tcRouter: TcRoutingService,
    private _cd: ChangeDetectorRef
  ) {}

  get templateForm(): FormGroup {
    return this._state.templateForm;
  }

  ngOnInit(): void {
    this._tcRouter.route$.pipe(takeUntil(this._destroy$)).subscribe((route: TCRoute) => {
      if (route.stepIndex === 3) {
        this.currentComponent = route.componentName ?? 'template_params';
        this._cd.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
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

    this._templateService
      .uploadYAML(templateYAML)
      .pipe(first())
      .subscribe({
        next: (successMsg: string) => {
          this._state.clear();
          this._graphManager.reset();
          this.creating$.next(false);
          this._alertService.showSuccess(successMsg);
        },
        error: (err: Error) => {
          this.creating$.next(false);
          this._alertService.showError(err.message);
        }
      });
  }

  /**
   * Gets errors string for template creation.
   *
   * @returns Errors string.
   */
  getCreationErrors(): string {
    const depGraph = this._graphManager.getCurrentGraph(DepGraphRef.TEMPLATE_CREATION).value;
    const errors: string[] = [];

    if (!this._state.templateForm.valid) {
      errors.push('Invalid template parameters.');
    }

    errors.push(...depGraph.errors());

    return errors.map(err => '- ' + err).join('\n');
  }

  /**
   * Decides if tempalte creation is disabled.
   *
   * @returns True if template creation is disabled.
   */
  isCreationDisabled(): boolean {
    const depGraph = this._graphManager.getCurrentGraph(DepGraphRef.TEMPLATE_CREATION).value;
    if (!this._state.templateForm.valid || !depGraph.isValid()) {
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
