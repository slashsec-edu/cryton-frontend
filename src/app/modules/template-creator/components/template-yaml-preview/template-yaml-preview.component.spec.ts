import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateYamlPreviewComponent } from './template-yaml-preview.component';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Spied } from 'src/app/testing/utility/utility-types';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('TemplateYamlPreviewComponent', () => {
  let component: TemplateYamlPreviewComponent;
  let fixture: ComponentFixture<TemplateYamlPreviewComponent>;

  const dialogRefStub = jasmine.createSpyObj('MatDiaogRef', ['close']) as Spied<
    MatDialogRef<TemplateYamlPreviewComponent>
  >;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TemplateYamlPreviewComponent],
      imports: [
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefStub },
        { provide: AlertService, useValue: alertServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: { template: null } }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TemplateYamlPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
