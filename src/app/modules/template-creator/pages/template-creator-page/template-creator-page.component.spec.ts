import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TemplateCreatorModule } from '../../template-creator.module';
import { TemplateCreatorPageComponent } from './template-creator-page.component';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { TemplateConverterService } from '../../services/template-converter.service';
import { Spied } from 'src/app/testing/utility/utility-types';
import { TemplateService } from 'src/app/services/template.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TemplateCreatorPageComponent', () => {
  let component: TemplateCreatorPageComponent;
  let fixture: ComponentFixture<TemplateCreatorPageComponent>;

  const converterStub = jasmine.createSpyObj('TemplateConverterService', [
    'editTemplate',
    'importYAMLTemplate',
    'importTemplate',
    'exportYAMLTemplate'
  ]) as Spied<TemplateConverterService>;

  const templateServiceStub = jasmine.createSpyObj('TemplateService', ['getTemplateDetail']) as Spied<TemplateService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateCreatorModule, BrowserAnimationsModule],
      declarations: [TemplateCreatorPageComponent],
      providers: [
        { provide: AlertService, useValue: alertServiceStub },
        { provide: TemplateConverterService, useValue: converterStub },
        { provide: TemplateService, useValue: templateServiceStub }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateCreatorPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
