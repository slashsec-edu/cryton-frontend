import { HttpClient } from '@angular/common/http';
import { WorkerInventoriesService } from './worker-inventories.service';

describe('WorkerInventoriesService', () => {
  let service: WorkerInventoriesService;
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']) as HttpClient;

  beforeEach(() => {
    service = new WorkerInventoriesService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
