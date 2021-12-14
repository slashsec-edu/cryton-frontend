import { Template } from 'src/app/models/api-responses/template.interface';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CrytonEditorStepsComponent } from 'src/app/generics/cryton-editor-steps.component';
import { TemplatesTableDataSource } from 'src/app/models/data-sources/templates-table.data-source';
import { TemplateService } from 'src/app/services/template.service';
import { Selectable } from 'src/app/models/cryton-editor/interfaces/selectable.interface';
import { PlanService } from 'src/app/services/plan.service';

@Component({
  selector: 'app-plans-creation-steps',
  templateUrl: './plans-creation-steps.component.html',
  styleUrls: ['./plans-creation-steps.component.scss']
})
export class PlansCreationStepsComponent extends CrytonEditorStepsComponent implements OnInit, OnDestroy {
  templatesDataSource: TemplatesTableDataSource;
  template: Template;
  inventories: File[];

  constructor(private _templateService: TemplateService, private _planService: PlanService) {
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
    this.inventories = files;

    if (files) {
      const selectables = files.map(file => ({ name: file.name, id: null } as Selectable));
      this.inputChange.emit({ selectables, completion: null });
    } else {
      this.inputChange.emit({ selectables: null, completion: null });
    }
  }

  erase(): void {
    this.template = null;
    this.inventories = null;
  }

  protected createPostRequest(): void {
    this.create.emit(this._planService.postPlan(this.template.id, this.inventories));
  }
}
