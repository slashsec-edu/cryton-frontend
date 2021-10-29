import { TestBed } from '@angular/core/testing';
import { TemplateService } from 'src/app/services/template.service';
import { Spied } from 'src/app/testing/utility/utility-types';

import { TemplateConverterService } from './template-converter.service';

describe('TemplateConverterService', () => {
  let service: TemplateConverterService;

  const templateServiceStub = jasmine.createSpyObj('TemplateService', ['getTemplateDetail']) as Spied<TemplateService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TemplateService, useValue: templateServiceStub }]
    });
    service = TestBed.inject(TemplateConverterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
