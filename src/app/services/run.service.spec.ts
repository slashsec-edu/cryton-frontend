import { RunService } from './run.service';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Spied } from 'src/app/testing/utility/utility-types';
import { ExecutionVariableService } from './execution-variable.service';

describe('RunService', () => {
  let service: RunService;
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']) as Spied<HttpClient>;
  const execVarServiceSpy = jasmine.createSpyObj('ExecutionVariableService', [
    'uploadVariables'
  ]) as Spied<ExecutionVariableService>;

  beforeEach(() => {
    service = new RunService(
      (httpClientSpy as unknown) as HttpClient,
      (execVarServiceSpy as unknown) as ExecutionVariableService
    );
    httpClientSpy.post.and.returnValue(of({}));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
