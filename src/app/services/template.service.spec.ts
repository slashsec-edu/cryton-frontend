import { HttpClient } from '@angular/common/http';
import { TemplateService } from './template.service';

describe('TemplateService', () => {
  let service: TemplateService;
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']) as HttpClient;

  beforeEach(() => {
    service = new TemplateService(httpClientSpy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
