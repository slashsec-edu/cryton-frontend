import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NodeManager } from '../../classes/dependency-tree/node-manager';
import { StageForm } from '../../classes/stage-creation/forms/stage-form';
import { StageParametersComponent } from './stage-parameters.component';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('StageParametersComponent', () => {
  let component: StageParametersComponent;
  let fixture: ComponentFixture<StageParametersComponent>;

  const testNodeManager = new NodeManager();
  const testStageForm = new StageForm(testNodeManager);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StageParametersComponent, ComponentInputDirective],
      imports: [
        SharedModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule
      ]
    })
      .overrideComponent(StageParametersComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StageParametersComponent);
    component = fixture.componentInstance;
    component.nodeManager = testNodeManager;
    component.stageForm = testStageForm;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
