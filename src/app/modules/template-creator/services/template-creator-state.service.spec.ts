import { TestBed } from '@angular/core/testing';

import { TemplateCreatorStateService } from './template-creator-state.service';

describe('TemplateCreatorStateService', () => {
  let service: TemplateCreatorStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TemplateCreatorStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
