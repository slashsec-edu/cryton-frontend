import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateStagePageComponent } from './create-stage-page.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ChangeDetectionStrategy, ViewContainerRef } from '@angular/core';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { StageParametersComponent } from '../../components/stage-parameters/stage-parameters.component';
import { CrytonButtonComponent } from 'src/app/modules/shared/components/cryton-button/cryton-button.component';
import { StageCreatorComponent } from '../../components/stage-creator/stage-creator.component';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Spied } from 'src/app/testing/utility/utility-types';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { MatIconModule } from '@angular/material/icon';
import { PortalModule } from '@angular/cdk/portal';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('CreateStagePageComponent', () => {
  let component: CreateStagePageComponent;
  let fixture: ComponentFixture<CreateStagePageComponent>;

  const viewContainerRefStub = jasmine.createSpyObj('ViewContainerRef', ['insert'], {
    injector: TestBed
  }) as Spied<ViewContainerRef>;

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
        { provide: ViewContainerRef, useValue: viewContainerRefStub }
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
