import { InstanceService } from './instance.service';
import { of } from 'rxjs';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Endpoint } from '../models/enums/endpoint.enum';
import { httpClientStub } from 'src/app/testing/stubs/http-client.stub';

describe('InstanceService', () => {
  let service: InstanceService;

  const endpoint = `http://${environment.crytonRESTApiHost}:${environment.crytonRESTApiPort}/cryton/api/v1/${Endpoint.INSTANCES}`;

  httpClientStub.post.and.returnValue(of({}));
  httpClientStub.delete.and.returnValue(of({}));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: HttpClient, useValue: httpClientStub }]
    });
    service = TestBed.inject(InstanceService);

    httpClientStub.get.and.callFake(() => of({ count: 0, results: [] }));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it(
    'should make a POST request',
    waitForAsync(() => {
      service.postItem({});
      expect(httpClientStub.post).toHaveBeenCalledWith(endpoint, {});
    })
  );

  it(
    'should make a DELETE request',
    waitForAsync(() => {
      service.deleteItem(1);
      expect(httpClientStub.delete).toHaveBeenCalledWith(endpoint + '1');
    })
  );

  it(
    'should make a GET request for a specific item',
    waitForAsync(() => {
      service.fetchItem(1);
      expect(httpClientStub.get).toHaveBeenCalledWith(endpoint + '1');
    })
  );
});
