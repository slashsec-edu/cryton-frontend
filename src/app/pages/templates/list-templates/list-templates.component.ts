import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { mergeMap, tap } from 'rxjs/operators';
import { renderComponentTrigger } from 'src/app/modules/shared/animations/render-component.animation';
import { TemplatesTableDataSource } from 'src/app/models/data-sources/templates-table.data-source';
import { Template } from 'src/app/models/api-responses/template.interface';
import { CertainityCheckComponent } from 'src/app/modules/shared/components/certainity-check/certainity-check.component';
import { CrytonTableComponent } from 'src/app/modules/shared/components/cryton-table/cryton-table.component';
import { TemplateService } from 'src/app/services/template.service';
import { Router } from '@angular/router';
import { ActionButton } from 'src/app/models/cryton-table/interfaces/action-button.interface';

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
  buttons: ActionButton<Template>[];

  constructor(private _templateService: TemplateService, private _dialog: MatDialog, private _router: Router) {}

  ngOnInit(): void {
    this.dataSource = new TemplatesTableDataSource(this._templateService);
    this.buttons = [{ name: 'delete', icon: 'delete', func: this._deleteTemplate }];
  }

  /**
   * Checks if you really want to delete the item, deletes it and updates
   * the table paginator.
   *
   * @param template Template to be deleted.
   */
  private _deleteTemplate = (template: Template): Observable<string> => {
    const dialogRef = this._dialog.open(CertainityCheckComponent);

    return dialogRef.afterClosed().pipe(
      mergeMap(res => (res ? this._templateService.deleteItem(template.id) : (of(null) as Observable<string>))),
      tap(res => {
        if (res) {
          this.templatesTable.updatePaginator();
        }
      })
    );
  };

  private _editTemplate = (template: Template): Observable<string> => {
    this._router.navigate(['app', 'templates', 'create', template.id]);
    return of(null) as Observable<string>;
  };
}
