import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DependencyTreeManagerService, DepTreeRef } from '../../services/dependency-tree-manager.service';
import { TemplateCreatorStateService } from '../../services/template-creator-state.service';
import { FormGroup } from '@angular/forms';
import { TemplateConverterService } from '../../services/template-converter.service';
import { TemplateService } from 'src/app/services/template.service';
import { AlertService } from 'src/app/services/alert.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TemplateCreatorHelpComponent } from '../../components/template-creator-help/template-creator-help.component';
import { NavigationButton } from '../../models/interfaces/navigation-button';
import { TCRoute, TcRoutingService } from '../../services/tc-routing.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-build-template-page',
  templateUrl: './build-template-page.component.html',
  styleUrls: ['./build-template-page.component.scss', '../../styles/template-creator.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildTemplatePageComponent implements OnInit, OnDestroy {
  templateDepTreeRef = DepTreeRef.TEMPLATE_CREATION;
  creating$ = new BehaviorSubject(false);

  currentComponent = 'template_params';

  // Navigation buttons
  depTreeNavigationBtns: NavigationButton[] = [
    { icon: 'description', name: 'Show template parameters', componentName: 'template_params' },
    { icon: 'schedule', name: 'Show timeline', componentName: 'timeline' }
  ];

  timelineNavigationBtns: NavigationButton[] = [
    { icon: 'description', name: 'Show template parameters', componentName: 'template_params' },
    { icon: 'account_tree', name: 'Show dependency tree', componentName: 'dep_tree' }
  ];

  private _destroy$ = new Subject<void>();

  get templateForm(): FormGroup {
    return this._state.templateForm;
  }

  constructor(
    private _treeManager: DependencyTreeManagerService,
    private _state: TemplateCreatorStateService,
    private _templateConverter: TemplateConverterService,
    private _templateService: TemplateService,
    private _alertService: AlertService,
    private _dialog: MatDialog,
    private _tcRouter: TcRoutingService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this._tcRouter.route$.pipe(takeUntil(this._destroy$)).subscribe((route: TCRoute) => {
      if (route.stepIndex === 3) {
        this.currentComponent = route.componentName;
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
    this.createTemplate();
  }

  /**
   * Creates YAML representation of the template and uploads it to the backend.
   */
  createTemplate(): void {
    const templateYaml = this._templateConverter.exportYAMLTemplate();
    const templateName = this._state.templateForm.get('name').value as string;

    this.creating$.next(true);

    this._templateService.uploadYAML(templateYaml, templateName).subscribe({
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
