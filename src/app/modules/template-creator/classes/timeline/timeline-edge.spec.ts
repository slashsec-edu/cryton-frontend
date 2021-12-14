import Konva from 'konva';
import { BehaviorSubject } from 'rxjs';
import { NodeType } from '../../models/enums/node-type';
import { Theme } from '../../models/interfaces/theme';
import { DeltaTrigger } from '../triggers/delta-trigger';
import { Trigger } from '../triggers/trigger';
import { DependencyTree } from '../dependency-tree/dependency-tree';
import { TemplateTimeline } from './template-timeline';
import { TimelineEdge } from './timeline-edge';
import { EDGE_ARROW_NAME } from './timeline-edge-constants';
import { StageNode } from '../dependency-tree/node/stage-node';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { KonvaContainerComponent } from 'src/app/testing/components/konva-container.component';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';

describe('TimelineEdge', () => {
  let fixture: ComponentFixture<KonvaContainerComponent>;
  let component: KonvaContainerComponent;
  // Edge
  let timelineEdge: TimelineEdge;

  // Environment
  let parentDepTree: DependencyTree;
  let timeline: TemplateTimeline;
  const theme$ = new BehaviorSubject<Theme>(mockTheme);

  // Parent and child stage
  let parentStage: StageNode;
  let parentStageDepTree: DependencyTree;
  let childStageDepTree: DependencyTree;
  let childStage: StageNode;

  const createEdge = (parentTrigger: Trigger<Record<string, any>>, childTrigger: Trigger<Record<string, any>>) => {
    parentStage = new StageNode({
      name: 'parent',
      childDepTree: parentStageDepTree,
      timeline,
      trigger: parentTrigger
    });
    childStage = new StageNode({
      name: 'child',
      childDepTree: childStageDepTree,
      timeline,
      trigger: childTrigger
    });

    parentStage.setParentDepTree(parentDepTree);
    childStage.setParentDepTree(parentDepTree);

    timeline.addNode(parentStage.timelineNode);
    timeline.addNode(childStage.timelineNode);
    timelineEdge = timeline.createEdge(parentStage.timelineNode, childStage.timelineNode);
  };

  const getArrow = (): Konva.Arrow => timeline.mainLayer.findOne(`.${EDGE_ARROW_NAME}`);

  const runTests = (isNoStart: boolean) => {
    describe('Initialization tests', () => {
      it('should create', () => {
        expect(timelineEdge).toBeTruthy();
        expect(getArrow()).toBeTruthy();
      });

      it('should create Konva.Arrow correctly', () => {
        expect(timelineEdge.konvaObject).toBeTruthy();
        const points = timelineEdge.konvaObject.points();
        const arrowWidth = points[2] - points[0];
        expect(arrowWidth).toBeGreaterThan(0);
      });

      it('should add dash if child node uses a trigger with undefined start time', () => {
        expect(timelineEdge.konvaObject.dash() != null).toEqual(isNoStart);
      });
    });

    it('should change theme correctly', () => {
      expect(timelineEdge.konvaObject.stroke()).toEqual(mockTheme.templateCreator.timelineEdge);

      const newStroke = '#000';
      const newTheme = JSON.parse(JSON.stringify(mockTheme)) as Theme;
      newTheme.templateCreator.timelineEdge = newStroke;
      timelineEdge.changeTheme(newTheme);

      expect(timelineEdge.konvaObject.stroke()).toEqual(newStroke);
    });
  };

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KonvaContainerComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(KonvaContainerComponent);
    component = fixture.componentInstance;

    parentDepTree = new DependencyTree(NodeType.CRYTON_STAGE);
    parentStageDepTree = new DependencyTree(NodeType.CRYTON_STEP);
    childStageDepTree = new DependencyTree(NodeType.CRYTON_STEP);
    timeline = new TemplateTimeline();
    component.afterInit = () => timeline.initKonva(component.konvaContainer.nativeElement, theme$.asObservable());
    fixture.detectChanges();
  });

  describe('Delta trigger tests', () => {
    beforeEach(() => {
      const parentTrigger = new DeltaTrigger({ hours: 0, minutes: 0, seconds: 0 });
      const childTrigger = new DeltaTrigger({ hours: 1, minutes: 0, seconds: 0 });
      createEdge(parentTrigger, childTrigger);
    });

    runTests(false);
  });
});
