import { TestBed } from '@angular/core/testing';

import { TcRoutingService } from './tc-routing.service';

describe('TcRoutingService', () => {
  let service: TcRoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TcRoutingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
