import { PortalModule } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CrytonButtonComponent } from 'src/app/modules/shared/components/cryton-button/cryton-button.component';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { AlertService } from 'src/app/services/alert.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { Spied } from 'src/app/testing/utility/utility-types';
import { StageCreatorComponent } from '../../../components/stage-creator/stage-creator.component';
import { StageParametersComponent } from '../../../components/stage-parameters/stage-parameters.component';
import { CreateStagePageComponent } from './create-stage-page.component';

describe('CreateStagePageComponent', () => {
  let component: CreateStagePageComponent;
  let fixture: ComponentFixture<CreateStagePageComponent>;

  const viewContainerRefStub = jasmine.createSpyObj('ViewContainerRef', ['insert'], {
    injector: TestBed
  }) as Spied<ViewContainerRef>;

  const matDialogStub = jasmine.createSpyObj('MatDialog', ['open']) as Spied<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CreateStagePageComponent,
        StageCreatorComponent,
        StageParametersComponent,
        CrytonButtonComponent,
        ComponentInputDirective
      ],
      imports: [
        BrowserAnimationsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatTooltipModule,
        MatIconModule,
        PortalModule,
        MatDividerModule,
        MatButtonModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: AlertService, useValue: alertServiceStub },
        { provide: ViewContainerRef, useValue: viewContainerRefStub },
        { provide: MatDialog, useValue: matDialogStub }
      ]
    })
      .overrideComponent(CreateStagePageComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateStagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
