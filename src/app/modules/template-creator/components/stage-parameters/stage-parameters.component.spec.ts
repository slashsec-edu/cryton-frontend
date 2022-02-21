import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { SharedModule } from 'src/app/modules/shared/shared.module';
import { DependencyGraph } from '../../classes/dependency-graph/dependency-graph';
import { NodeManager } from '../../classes/dependency-graph/node-manager';
import { StageForm } from '../../classes/stage-creation/forms/stage-form';
import { NodeType } from '../../models/enums/node-type';
import { StageParametersComponent } from './stage-parameters.component';

describe('StageParametersComponent', () => {
  let component: StageParametersComponent;
  let fixture: ComponentFixture<StageParametersComponent>;

  const depGraph = new DependencyGraph(NodeType.CRYTON_STEP);
  const testNodeManager = new NodeManager(depGraph);
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
