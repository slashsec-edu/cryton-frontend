import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { TemplatesTableDataSource } from 'src/app/models/data-sources/templates-table.data-source';
import { Template } from 'src/app/models/api-responses/template.interface';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { TemplateService } from 'src/app/services/template.service';
import { LinkButton } from 'src/app/modules/shared/components/cryton-table/buttons/link-button';
import { TableButton } from 'src/app/modules/shared/components/cryton-table/buttons/table-button';
import { DeleteButton } from 'src/app/modules/shared/components/cryton-table/buttons/delete-button';

@Component({
  selector: 'app-list-templates',
  templateUrl: './list-templates.component.html',
  styleUrls: ['./list-templates.component.scss'],
  animations: [renderComponentTrigger]
})
export class ListTemplatesComponent implements OnInit {
  @ViewChild(CrytonTableComponent)
  templatesTable: CrytonTableComponent<Template>;

  dataSource: TemplatesTableDataSource;
  buttons: TableButton[];

  constructor(private _templateService: TemplateService, private _dialog: MatDialog) {}

  ngOnInit(): void {
    this.dataSource = new TemplatesTableDataSource(this._templateService);
    this.buttons = [
      new LinkButton('Show YAML', 'description', '/app/templates/:id/yaml'),
      new DeleteButton<Template>(this._templateService, this._dialog)
    ];
  }
}
