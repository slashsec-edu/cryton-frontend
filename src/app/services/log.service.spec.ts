import { TestBed } from '@angular/core/testing';

import { LogService } from './log.service';
import { httpClientStub } from 'src/app/testing/stubs/http-client.stub';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

describe('LogService', () => {
  let service: LogService;

  httpClientStub.post.and.returnValue(of({}));
  httpClientStub.delete.and.returnValue(of({}));
  httpClientStub.get.and.callFake(() => of({ count: 0, results: [] }));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpClientStub }]
    });
    service = TestBed.inject(LogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
