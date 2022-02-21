import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { first } from 'rxjs/operators';
import { CrytonEditorStepsComponent } from 'src/app/generics/cryton-editor-steps.component';
import { Template } from 'src/app/models/api-responses/template.interface';
import { Selectable } from 'src/app/models/cryton-editor/interfaces/selectable.interface';
import { TemplatesTableDataSource } from 'src/app/models/data-sources/templates-table.data-source';
import { CrytonFileUploaderComponent } from 'src/app/modules/shared/components/cryton-file-uploader/cryton-file-uploader.component';
import { CrytonInventoryCreatorComponent } from 'src/app/modules/shared/components/cryton-inventory-creator/cryton-inventory-creator.component';
import { PlanService } from 'src/app/services/plan.service';
import { TemplateService } from 'src/app/services/template.service';
import { parse, stringify } from 'yaml';

@Component({
  selector: 'app-plans-creation-steps',
  templateUrl: './plans-creation-steps.component.html',
  styleUrls: ['./plans-creation-steps.component.scss']
})
export class PlansCreationStepsComponent extends CrytonEditorStepsComponent implements OnInit, OnDestroy {
  @ViewChild(CrytonFileUploaderComponent) fileUploader: CrytonFileUploaderComponent;
  templatesDataSource: TemplatesTableDataSource;
  template: Template;
  inventory: File[] | string;

  constructor(
    private _templateService: TemplateService,
    private _planService: PlanService,
    private _dialog: MatDialog
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.templatesDataSource = new TemplatesTableDataSource(this._templateService);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  setTemplate(template: Template): void {
    this.template = template;
    this.emitSelectables([{ name: template.file, id: template.id }]);
  }

  handleUpload(files: File[]): void {
    this.inventory = files;
    this.emitSelection();
  }

  cancelInventory(): void {
    this.fileUploader.discardFiles();
    this.inventory = null;
    this.inputChange.emit({ selectables: null, completion: null });
  }

  createInventory(): void {
    const inventoryDialog = this._dialog.open(CrytonInventoryCreatorComponent, {
      data: { inventory: this._isFileInventory() ? null : this.inventory }
    });

    inventoryDialog
      .afterClosed()
      .pipe(first())
      .subscribe((yaml: string) => {
        if (yaml) {
          this.fileUploader.discardFiles();
          this.inventory = yaml;
          this.emitSelection();
        }
      });
  }

  emitSelection(): void {
    if (this.inventory) {
      if (Array.isArray(this.inventory)) {
        const selectables = this.inventory.map(file => ({ name: file.name, id: null } as Selectable));
        this.inputChange.emit({ selectables, completion: null });
      } else {
        const selectables = Object.entries(parse(this.inventory) as Record<string, string>).map(
          (entry: [string, string]) => ({
            name: `${entry[0]}: ${stringify(entry[1])}`,
            id: null
          })
        );

        this.inputChange.emit({ selectables, completion: null });
      }
    } else {
      this.inputChange.emit({ selectables: null, completion: null });
    }
  }

  erase(): void {
    this.template = null;
    this.inventory = null;
  }

  protected createPostRequest(): void {
    this.create.emit(this._planService.postPlan(this.template.id, this.inventory));
  }

  private _isFileInventory(): boolean {
    return Array.isArray(this.inventory);
  }
}
