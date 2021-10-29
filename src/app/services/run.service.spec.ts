import { RunService } from './run.service';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Spied } from 'src/app/testing/utility/utility-types';

describe('RunService', () => {
  let service: RunService;
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']) as Spied<HttpClient>;

  beforeEach(() => {
    service = new RunService((httpClientSpy as unknown) as HttpClient);
    httpClientSpy.post.and.returnValue(of({}));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
