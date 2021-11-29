import { Injectable } from '@angular/core';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { CrytonResponse } from '../models/api-responses/cryton-response.interface';
import { TemplateDetail } from '../models/api-responses/template-detail.interface';
import { Template } from '../models/api-responses/template.interface';
import { TableData } from '../models/api-responses/table-data.interface';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TableFilter } from '../models/cryton-table/interfaces/table-filter.interface';
import { Observable } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { CrytonRESTApiEndpoint } from '../models/enums/cryton-rest-api-endpoint.enum';
import { TemplateDescription } from '../modules/template-creator/models/interfaces/template-description';
import { parse } from 'yaml';

@Injectable({
  providedIn: 'root'
})
export class TemplateService extends CrytonRESTApiService<Template> {
  protected _endpoint = CrytonRESTApiService.buildEndpointURL(CrytonRESTApiEndpoint.TEMPLATES, 'v1');

  constructor(protected http: HttpClient) {
    super(http);
  }

  fetchItems(
    offset: number,
    limit: number,
    orderBy: string = 'id',
    filter: TableFilter
  ): Observable<TableData<Template>> {
    let params: HttpParams = new HttpParams().set('offset', offset.toString()).set('limit', limit.toString());

    if (orderBy && orderBy !== '') {
      params = params.append('order_by', orderBy);
    }
    if (filter && filter.filter && filter.column) {
      params = params.append(filter.column, filter.filter);
    }

    return this.http
      .get<CrytonResponse<Template>>(this._endpoint, { params })
      .pipe(
        // Extracting file name from file url
        tap(items => {
          items.results = items.results.map(
            (result: Template) =>
              ({
                url: result.url,
                id: result.id,
                file: this._getFileName(result.file)
              } as Template)
          );
        }),
        map(items => ({ count: items.count, data: items.results } as TableData<Template>)),
        catchError(this.handleDatasetError)
      );
  }

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    return this.postItem(formData);
  }

  uploadYAML(templateYaml: string): Observable<string> {
    const template = parse(templateYaml) as TemplateDescription;

    const templateFile = new File([templateYaml], template.plan.name, { type: 'text/plain' });
    return this.uploadFile(templateFile);
  }

  getTemplateDetail(templateID: number): Observable<TemplateDetail | string> {
    return this.http
      .get<TemplateDetail>(`${this._endpoint}${templateID}/get_template/`)
      .pipe(catchError(err => this.handleItemError(err, `Template detail couldn't be fetched.`)));
  }

  private _getFileName(url: string): string {
    const lastSlash = url.lastIndexOf('/');
    return url.substr(lastSlash + 1);
  }
}
