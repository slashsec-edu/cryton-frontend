import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';
import { CrytonRESTApiService } from '../generics/cryton-rest-api-service';
import { Plan } from '../models/api-responses/plan.interface';
import { Endpoint } from '../models/enums/endpoint.enum';
import { HasYaml } from '../models/services/has-yaml.interface';

@Injectable({
  providedIn: 'root'
})
export class PlanService extends CrytonRESTApiService<Plan> implements HasYaml {
  endpoint = CrytonRESTApiService.buildEndpointURL(Endpoint.PLANS, 'v1');

  constructor(protected http: HttpClient) {
    super(http);
  }

  postPlan(templateID: number, inventory: File[] | string): Observable<string> {
    const formData = new FormData();

    formData.append('plan_template', templateID.toString());

    if (inventory) {
      if (Array.isArray(inventory)) {
        for (const file of inventory) {
          formData.append('inventory_file', file, 'inventory_file');
        }
      } else {
        formData.append('inventory_file', inventory);
      }
    }

    return this.http.post(this.endpoint, formData).pipe(
      mapTo('Plan created successfully.'),
      catchError((err: HttpErrorResponse) => this.handleItemError(err, 'Plan creation failed.'))
    );
  }

  fetchYaml(planID: number): Observable<Record<string, unknown>> {
    return this.http.get<Record<string, unknown>>(`${this.endpoint}/${planID}/get_plan`);
  }
}
