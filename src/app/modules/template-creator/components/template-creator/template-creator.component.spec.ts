import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TemplateCreatorModule } from '../../template-creator.module';
import { TemplateCreatorComponent } from './template-creator.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { ChangeDetectionStrategy } from '@angular/core';
import { TemplateService } from 'src/app/services/template.service';
import { Spied } from 'src/app/testing/utility/utility-types';

describe('TemplateCreatorComponent', () => {
  let component: TemplateCreatorComponent;
  let fixture: ComponentFixture<TemplateCreatorComponent>;

  const templateServiceStub = jasmine.createSpyObj('TemplateService', ['getTemplateDetail']) as Spied<TemplateService>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [TemplateCreatorComponent],
        imports: [TemplateCreatorModule, BrowserAnimationsModule, NoopAnimationsModule],
        providers: [
          { provide: AlertService, useValue: alertServiceStub },
          { provide: TemplateService, useValue: templateServiceStub }
        ]
      })
        .overrideComponent(TemplateCreatorComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
        .compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
