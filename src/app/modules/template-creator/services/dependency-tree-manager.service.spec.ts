import { TestBed } from '@angular/core/testing';

import { DependencyTreeManagerService } from './dependency-tree-manager.service';

describe('DependencyTreeManagerService', () => {
  let service: DependencyTreeManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DependencyTreeManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
