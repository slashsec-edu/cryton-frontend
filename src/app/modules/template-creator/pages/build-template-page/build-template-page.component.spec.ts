import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertService } from 'src/app/services/alert.service';
import { TemplateService } from 'src/app/services/template.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { Spied } from 'src/app/testing/utility/utility-types';
import { BuildTemplatePageComponent } from './build-template-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PortalModule } from '@angular/cdk/portal';
import { CrytonButtonComponent } from 'src/app/modules/shared/components/cryton-button/cryton-button.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';

describe('BuildTemplatePageComponent', () => {
  let component: BuildTemplatePageComponent;
  let fixture: ComponentFixture<BuildTemplatePageComponent>;

  const matDialogStub = jasmine.createSpyObj('MatDialog', ['open']) as Spied<MatDialog>;
  const templateServiceStub = jasmine.createSpyObj('TemplateService', ['getTemplateDetail']) as Spied<TemplateService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatInputModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatTooltipModule,
        PortalModule,
        MatIconModule,
        MatButtonModule
      ],
      declarations: [BuildTemplatePageComponent, CrytonButtonComponent],
      providers: [
        { provide: AlertService, useValue: alertServiceStub },
        { provide: TemplateService, useValue: templateServiceStub },
        { provide: MatDialog, useValue: matDialogStub }
      ]
    })
      .overrideComponent(BuildTemplatePageComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuildTemplatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
