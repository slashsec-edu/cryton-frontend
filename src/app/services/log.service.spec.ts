import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { httpClientStub } from 'src/app/testing/stubs/http-client.stub';
import { LogService } from './log.service';

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
