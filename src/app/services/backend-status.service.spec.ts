import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { Spied } from '../testing/utility/utility-types';
import { BackendStatusService } from './backend-status.service';

describe('BackendStatusService', () => {
  let service: BackendStatusService;

  const isLive$ = new BehaviorSubject<{ ok: boolean }>({ ok: true });
  const httpClientStub = jasmine.createSpyObj('HttpClient', ['get']) as Spied<HttpClient>;
  httpClientStub.get.and.returnValue(isLive$.asObservable());

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpClientStub }]
    });
    service = TestBed.inject(BackendStatusService);
  });

  beforeEach(() => {
    isLive$.next({ ok: true });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit true when backend response is ok', done => {
    service.checkBackendStatus().subscribe(isLive => {
      expect(isLive).toBeTrue();
      done();
    });
  });

  it('should emit false when backend response is not ok', done => {
    isLive$.next({ ok: false });

    service.checkBackendStatus().subscribe(isLive => {
      expect(isLive).toBeFalse();
      done();
    });
  });
});
