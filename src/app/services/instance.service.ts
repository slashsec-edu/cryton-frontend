import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrytonDataService } from '../generics/cryton-data.service';
import { Instance } from '../models/api-responses/instance.interface';
import { Observable } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Endpoint } from '../models/enums/endpoint.enum';

@Injectable({
  providedIn: 'root'
})
export class InstanceService extends CrytonDataService<Instance> {
  protected endpoint = `${environment.baseUrl}${Endpoint.INSTANCES}`;

  constructor(protected http: HttpClient) {
    super(http);
  }

  postInstance(templateID: number, files: File[]): Observable<string> {
    const formData = new FormData();

    formData.append('plan_template', templateID.toString());
    if (files) {
      for (const file of files) {
        formData.append('inventory_file', file, 'inventory_file');
      }
    }

    return this.http.post(this.endpoint, formData).pipe(
      mapTo('Instance created successfully.'),
      catchError(err => this.handleBasicError(err, 'Instance creation failed.'))
    );
  }
}
