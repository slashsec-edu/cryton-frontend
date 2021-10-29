import { Injectable } from '@angular/core';
import { Worker } from '../models/api-responses/worker.interface';
import { HttpClient } from '@angular/common/http';
import { CrytonDataService } from '../generics/cryton-data.service';
import { environment } from 'src/environments/environment';
import { Endpoint } from '../models/enums/endpoint.enum';

@Injectable({
  providedIn: 'root'
})
export class WorkersService extends CrytonDataService<Worker> {
  protected endpoint = `${environment.baseUrl}${Endpoint.WORKERS}`;

  constructor(protected http: HttpClient) {
    super(http);
  }
}
