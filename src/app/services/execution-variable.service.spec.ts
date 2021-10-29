import { HttpClient } from '@angular/common/http';
import { ExecutionVariableService } from './execution-variable.service';

describe('ExecutionVariableService', () => {
  let service: ExecutionVariableService;
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']) as HttpClient;

  beforeEach(() => {
    service = new ExecutionVariableService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
