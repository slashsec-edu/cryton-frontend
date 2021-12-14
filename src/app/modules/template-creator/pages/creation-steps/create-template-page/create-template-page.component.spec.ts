import { ChangeDetectionStrategy } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertService } from 'src/app/services/alert.service';
import { TemplateService } from 'src/app/services/template.service';
import { alertServiceStub } from 'src/app/testing/stubs/alert-service.stub';
import { Spied } from 'src/app/testing/utility/utility-types';
import { CreateTemplatePageComponent } from './create-template-page.component';
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
import { DependencyGraph } from '../../../classes/dependency-graph/dependency-graph';
import { NodeType } from '../../../models/enums/node-type';
import { StageNodeUtils } from 'src/app/testing/utility/stage-node-utils';
import { TemplateTimeline } from '../../../classes/timeline/template-timeline';
import { DependencyGraphManagerService } from '../../../services/dependency-graph-manager.service';
import { TemplateCreatorStateService } from '../../../services/template-creator-state.service';
import { TemplateConverterService } from '../../../services/template-converter.service';
import { basicTemplateDescription } from 'src/app/testing/mockdata/cryton-templates/basic-template';
import { of } from 'rxjs';

describe('CreateTemplatePageComponent', () => {
  let component: CreateTemplatePageComponent;
  let fixture: ComponentFixture<CreateTemplatePageComponent>;

  const matDialogStub = jasmine.createSpyObj('MatDialog', ['open']) as Spied<MatDialog>;
  const templateServiceStub = jasmine.createSpyObj('TemplateService', [
    'getTemplateDetail',
    'uploadYAML'
  ]) as Spied<TemplateService>;
  templateServiceStub.uploadYAML.and.returnValue(of('Item created successfully.'));

  const correctGraph = new DependencyGraph(NodeType.CRYTON_STAGE);
  const correctTimeline = new TemplateTimeline();
  const stageNodeUtils = new StageNodeUtils(correctGraph, correctTimeline);
  const correctStage = stageNodeUtils.createDeltaNode('delta', { hours: 0, minutes: 0, seconds: 0 });
  correctGraph.graphNodeManager.addNode(correctStage);

  const graphManagerStub = jasmine.createSpyObj('DependencyGraphManagerService', [
    'getCurrentGraph',
    'reset'
  ]) as Spied<DependencyGraphManagerService>;

  graphManagerStub.getCurrentGraph.and.returnValue({ value: correctGraph });

  const tcState = new TemplateCreatorStateService();

  const templateConverterStub = jasmine.createSpyObj('TemplateConverterService', [
    'exportYAMLTemplate'
  ]) as Spied<TemplateConverterService>;
  templateConverterStub.exportYAMLTemplate.and.returnValue(basicTemplateDescription);

  const dialogRef = {
    afterClosed: () => of(basicTemplateDescription)
  };
  matDialogStub.open.and.returnValue(dialogRef);

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
      declarations: [CreateTemplatePageComponent, CrytonButtonComponent],
      providers: [
        { provide: AlertService, useValue: alertServiceStub },
        { provide: TemplateService, useValue: templateServiceStub },
        { provide: DependencyGraphManagerService, useValue: graphManagerStub },
        { provide: MatDialog, useValue: matDialogStub },
        { provide: TemplateCreatorStateService, useValue: tcState },
        { provide: TemplateConverterService, useValue: templateConverterStub }
      ]
    })
      .overrideComponent(CreateTemplatePageComponent, { set: { changeDetection: ChangeDetectionStrategy.Default } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTemplatePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create a new stage after getting the edited value from dialog', () => {
    tcState.templateForm.setValue({ name: 'a', owner: 'a' }); // Satisfying required properties
    component.handleCreate();
    expect(templateServiceStub.uploadYAML).toHaveBeenCalledWith(basicTemplateDescription);
  });
});
