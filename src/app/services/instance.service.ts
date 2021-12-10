import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { Instance } from '../models/api-responses/instance.interface';
import { Observable } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { CrytonRESTApiEndpoint } from '../models/enums/cryton-rest-api-endpoint.enum';

@Injectable({
  providedIn: 'root'
})
export class InstanceService extends CrytonRESTApiService<Instance> {
  endpoint = CrytonRESTApiService.buildEndpointURL(CrytonRESTApiEndpoint.INSTANCES, 'v1');

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
      catchError(err => this.handleItemError(err, 'Instance creation failed.'))
    );
  }
}
