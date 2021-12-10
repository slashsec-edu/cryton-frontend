import { HttpClient } from '@angular/common/http';
import { Spied } from '../testing/utility/utility-types';
import { RunService } from './run.service';
import { WorkersService } from './workers.service';

describe('WorkersService', () => {
  let service: WorkersService;
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']) as HttpClient;
  const runServiceStub = jasmine.createSpyObj('RunService', ['fetchItem']) as Spied<RunService>;

  beforeEach(() => {
    service = new WorkersService(httpClientSpy, (runServiceStub as unknown) as RunService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
