import Konva from 'konva';
import { BehaviorSubject } from 'rxjs';
import { NodeType } from '../../models/enums/node-type';
import { TriggerType } from '../../models/enums/trigger-type';
import { HTTPListenerArgs } from '../../models/interfaces/http-listener-args';
import { Theme } from '../../models/interfaces/theme';
import { CrytonStageEdge } from '../cryton-edge/cryton-stage-edge';
import { CrytonStage } from '../cryton-node/cryton-stage';
import { DeltaTrigger } from '../cryton-node/triggers/delta-trigger';
import { HttpTrigger } from '../cryton-node/triggers/http-trigger';
import { Trigger } from '../cryton-node/triggers/trigger';
import { TriggerFactory } from '../cryton-node/triggers/trigger-factory';
import { DependencyTree } from '../dependency-tree/dependency-tree';
import { TemplateTimeline } from './template-timeline';
import { TimelineEdge } from './timeline-edge';
import { EDGE_ARROW_NAME } from './timeline-edge-constants';

const DEFAULT_STROKE = '#fff';

const HTTP_TRIGGER_ARGS: HTTPListenerArgs = {
  host: '127.0.0.1',
  port: 8080,
  routes: [
    {
      path: '/',
      method: 'GET',
      parameters: [{ name: 'result', value: 'OK' }]
    }
  ]
};

describe('TimelineEdge', () => {
  // Edge
  let timelineEdge: TimelineEdge;
  let crytonStageEdge: CrytonStageEdge;

  // Environment
  let parentDepTree: DependencyTree;
  let timeline: TemplateTimeline;
  const theme = {
    primary: '#fff',
    accent: '#fff',
    warn: '#fff',
    isDark: true,
    templateCreator: {
      tick: '#fff',
      leadingTick: '#fff',
      timemarkText: '#fff',
      timelineEdge: DEFAULT_STROKE,
      timelineEdgeHover: '#fff',
      treeEdge: '#fff',
      treeNodeRect: '#fff',
      labelBG: '#fff',
      nodeTimemarkTick: '#fff',
      paddingMaskTop: '#fff',
      background: '#fff'
    }
  };
  const theme$ = new BehaviorSubject<Theme>(theme);

  // Parent and child stage
  let parentStage: CrytonStage;
  let parentStageDepTree: DependencyTree;
  let childStageDepTree: DependencyTree;
  let childStage: CrytonStage;

  const createEdge = (parentTrigger: Trigger<Record<string, any>>, childTrigger: Trigger<Record<string, any>>) => {
    parentStage = new CrytonStage({
      name: 'parent',
      parentDepTree,
      childDepTree: parentStageDepTree,
      timeline,
      trigger: parentTrigger
    });
    childStage = new CrytonStage({
      name: 'child',
      parentDepTree,
      childDepTree: childStageDepTree,
      timeline,
      trigger: childTrigger
    });

    crytonStageEdge = parentDepTree.createDraggedEdge(parentStage) as CrytonStageEdge;
    parentDepTree.connectDraggedEdge(childStage);
    timelineEdge = crytonStageEdge.timelineEdge;
  };

  const copyTheme = (): Theme => {
    const tcTheme = Object.assign({}, theme.templateCreator);
    const newTheme = Object.assign({}, theme);
    newTheme.templateCreator = tcTheme;
    return newTheme;
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
      timelineEdge.changeTheme(theme);
      expect(timelineEdge.konvaObject.stroke()).toEqual(DEFAULT_STROKE);

      const newStroke = '#000';
      const newTheme = copyTheme();
      newTheme.templateCreator.timelineEdge = newStroke;
      timelineEdge.changeTheme(newTheme);

      expect(timelineEdge.konvaObject.stroke()).toEqual(newStroke);
    });
  };

  beforeEach(() => {
    parentDepTree = new DependencyTree(NodeType.CRYTON_STAGE);
    parentStageDepTree = new DependencyTree(NodeType.CRYTON_STEP);
    childStageDepTree = new DependencyTree(NodeType.CRYTON_STEP);
    timeline = new TemplateTimeline();
    timeline.initKonva(document.createElement('div'), theme$.asObservable());
  });

  describe('Delta trigger tests', () => {
    beforeEach(() => {
      const parentTrigger = new DeltaTrigger({ hours: 0, minutes: 0, seconds: 0 });
      const childTrigger = new DeltaTrigger({ hours: 1, minutes: 0, seconds: 0 });
      createEdge(parentTrigger, childTrigger);
    });

    runTests(false);

    it('should add dash when child node trigger changes to HTTP listener', () => {
      expect(timelineEdge.konvaObject.dash()).toBeFalsy();

      const httpTrigger = TriggerFactory.createTrigger(TriggerType.HTTP_LISTENER, HTTP_TRIGGER_ARGS);
      childStage.trigger = httpTrigger;
      timelineEdge.updateEdgeStyle();

      expect(timelineEdge.konvaObject.dash()).toBeTruthy();
    });
  });

  describe('HTTP listener trigger tests', () => {
    beforeEach(() => {
      const parentTrigger = new HttpTrigger(HTTP_TRIGGER_ARGS);
      const childTrigger = new HttpTrigger(HTTP_TRIGGER_ARGS);
      createEdge(parentTrigger, childTrigger);
    });

    runTests(true);

    it('should remove dash when child node trigger changes to delta listener', () => {
      expect(timelineEdge.konvaObject.dash()).toBeTruthy();

      const deltaTrigger = TriggerFactory.createTrigger(TriggerType.DELTA, { hours: 1, minutes: 0, seconds: 0 });
      childStage.trigger = deltaTrigger;
      timelineEdge.updateEdgeStyle();

      expect(timelineEdge.konvaObject.dash()).toBeFalsy();
    });
  });
});
