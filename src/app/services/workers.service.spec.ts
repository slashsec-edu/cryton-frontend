import { HttpClient } from '@angular/common/http';
import { WorkersService } from './workers.service';

describe('WorkersService', () => {
  let service: WorkersService;
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']) as HttpClient;

  beforeEach(() => {
    service = new WorkersService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
