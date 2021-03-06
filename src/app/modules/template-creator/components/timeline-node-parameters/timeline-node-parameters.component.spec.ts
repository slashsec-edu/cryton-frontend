import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CrytonButtonComponent } from 'src/app/modules/shared/components/cryton-button/cryton-button.component';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';
import { AlertService } from 'src/app/services/alert.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { Spied } from 'src/app/testing/utility/utility-types';
import { DependencyGraph } from '../../classes/dependency-graph/dependency-graph';
import { StageNode } from '../../classes/dependency-graph/node/stage-node';
import { TemplateTimeline } from '../../classes/timeline/template-timeline';
import { TriggerFactory } from '../../classes/triggers/trigger-factory';
import { NodeType } from '../../models/enums/node-type';
import { TriggerType } from '../../models/enums/trigger-type';
import { StageParametersComponent } from '../stage-parameters/stage-parameters.component';
import { TimelineNodeParametersComponent } from './timeline-node-parameters.component';

describe('TimelineNodeParametersComponent', () => {
  let component: TimelineNodeParametersComponent;
  let fixture: ComponentFixture<TimelineNodeParametersComponent>;

  const testingParentDepGraph = new DependencyGraph(NodeType.CRYTON_STAGE);
  const testingChildDepGraph = new DependencyGraph(NodeType.CRYTON_STEP);
  const testingTimeline = new TemplateTimeline();
  const testingTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 0 });

  const testingStage = new StageNode({
    name: 'Testing stage',
    childDepGraph: testingChildDepGraph,
    timeline: testingTimeline,
    trigger: testingTrigger
  });
  testingStage.setParentDepGraph(testingParentDepGraph);
  const dialogDataStub = jasmine.createSpyObj('MAT_DIALOG_DATA', [], { stage: testingStage }) as Spied<{
    stage: StageNode;
  }>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        MatSelectModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule
      ],
      declarations: [
        TimelineNodeParametersComponent,
        StageParametersComponent,
        CrytonButtonComponent,
        ComponentInputDirective
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: AlertService, useValue: alertServiceStub },
        { provide: MAT_DIALOG_DATA, useValue: dialogDataStub }
      ]
    })
      .overrideComponent(TimelineNodeParametersComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineNodeParametersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
