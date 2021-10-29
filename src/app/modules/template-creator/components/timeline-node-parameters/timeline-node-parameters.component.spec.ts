import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TimelineNodeParametersComponent } from './timeline-node-parameters.component';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { AlertService } from 'src/app/services/alert.service';
import { CrytonStage } from '../../classes/cryton-node/cryton-stage';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { NodeType } from '../../models/enums/node-type';
import { TemplateTimeline } from '../../classes/timeline/template-timeline';
import { TriggerFactory } from '../../classes/cryton-node/triggers/trigger-factory';
import { TriggerType } from '../../models/enums/trigger-type';
import { Spied } from 'src/app/testing/utility/utility-types';
import { StageParametersComponent } from '../stage-parameters/stage-parameters.component';
import { CrytonButtonComponent } from 'src/app/modules/shared/components/cryton-button/cryton-button.component';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ComponentInputDirective } from 'src/app/modules/shared/directives/component-input.directive';

describe('TimelineNodeParametersComponent', () => {
  let component: TimelineNodeParametersComponent;
  let fixture: ComponentFixture<TimelineNodeParametersComponent>;

  const testingParentDepTree = new DependencyTree(NodeType.CRYTON_STAGE);
  const testingChildDepTree = new DependencyTree(NodeType.CRYTON_STEP);
  const testingTimeline = new TemplateTimeline();
  const testingTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 0, minutes: 0, seconds: 0 });

  const testingStage = new CrytonStage({
    name: 'Testing stage',
    parentDepTree: testingParentDepTree,
    childDepTree: testingChildDepTree,
    timeline: testingTimeline,
    trigger: testingTrigger
  });
  const dialogDataStub = jasmine.createSpyObj('MAT_DIALOG_DATA', [], { stage: testingStage }) as Spied<{
    stage: CrytonStage;
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
        MatButtonModule
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
