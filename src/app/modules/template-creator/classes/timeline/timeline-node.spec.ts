import Konva from 'konva';
import { BehaviorSubject } from 'rxjs';
import { NodeTimemark } from 'src/app/modules/shared/classes/node-timemark';
import { Tick } from 'src/app/modules/shared/classes/tick';
import { Theme } from '../../models/interfaces/theme';
import { TemplateTimeline } from './template-timeline';
import { TimelineNode } from './timeline-node';
import {
  LABEL_TAG_NAME,
  LABEL_TEXT_NAME,
  MAX_NAME_LENGTH,
  NODE_CIRCLE_NAME,
  NODE_LABEL_NAME,
  NODE_LTICK_NAME,
  NODE_LTICK_TIMEMARK_NAME
} from './timeline-node-constants';
import { mockTheme } from 'src/app/testing/mockdata/theme.mockdata';
import { StageEdge } from '../dependency-tree/edge/stage-edge';
import { StageNode } from '../dependency-tree/node/stage-node';

const DEFAULT_STAGE_NAME = 'name';
const CANVAS_CONTAINER_ID = 'canvasContainer';

const theme$ = new BehaviorSubject<Theme>(mockTheme);

const canvasContainer = document.createElement('div');
canvasContainer.setAttribute('id', CANVAS_CONTAINER_ID);

class StageNodeFake {
  name = DEFAULT_STAGE_NAME;
  childEdges: StageEdge[] = [];
  parentEdges: StageEdge[] = [];
  timeline = new TemplateTimeline();
  triggerTag: Konva.Text = null;

  trigger = {
    getStartTime: () => this.startTime,
    getTag: () => this.triggerTag
  };

  startTime = 0;

  constructor(name?: string, triggerTag?: Konva.Text) {
    if (name) {
      this.name = name;
    }
    this.triggerTag = triggerTag;

    this.timeline.initKonva(canvasContainer, theme$.asObservable());
  }
}

describe('TimelineNode', () => {
  let timelineNode: TimelineNode;
  let crytonStage: StageNodeFake;

  const getCircle = (): Konva.Circle => timelineNode.konvaObject.findOne(`.${NODE_CIRCLE_NAME}`);
  const getLabel = (): Konva.Label => timelineNode.konvaObject.findOne(`.${NODE_LABEL_NAME}`);
  const getLabelTag = (): Konva.Tag => getLabel().findOne(`.${LABEL_TAG_NAME}`);
  const getLabelText = (): Konva.Text => getLabel().findOne(`.${LABEL_TEXT_NAME}`);
  const getLTick = (): Tick => timelineNode.timeline.tickLayer.findOne(`.${NODE_LTICK_NAME}`);
  const getLTickTimemark = (): NodeTimemark =>
    timelineNode.timeline.timeMarkLayer.findOne(`.${NODE_LTICK_TIMEMARK_NAME}`);

  beforeEach(() => {
    crytonStage = new StageNodeFake();
    timelineNode = new TimelineNode((crytonStage as unknown) as StageNode);
  });

  it('should create', () => {
    expect(timelineNode).toBeTruthy();
    expect(timelineNode.konvaObject).toBeTruthy();
  });

  describe('Node initialization tests', () => {
    it('should render node circle correctly', () => {
      expect(getCircle()).toBeTruthy();
    });

    it('should initialize node label correctly', () => {
      expect(getLabel()).toBeTruthy();
      expect(getLabelTag()).toBeTruthy();

      const labelText = getLabelText();
      expect(getLabelText()).toBeTruthy();
      expect(labelText.text()).toEqual(DEFAULT_STAGE_NAME);
    });

    it('should shorten label text if it exceeds max name length', () => {
      const longName = Array(MAX_NAME_LENGTH + 1)
        .fill('a')
        .join('');
      crytonStage = new StageNodeFake(longName);
      timelineNode = new TimelineNode((crytonStage as unknown) as StageNode);

      expect(getLabelText().text().endsWith('...')).toBeTrue();
    });
  });

  describe('Node events tests', () => {
    it('should correctly select node on shift click', () => {
      spyOn(crytonStage.timeline.selectedNodes, 'add');
      spyOn(timelineNode, 'select');

      // Click event is bound to circle, it doesn't work with node's konva object.
      const nodeCircle = getCircle();
      nodeCircle.fire('click', { evt: { shiftKey: true } });

      expect(timelineNode.select).toHaveBeenCalled();
    });

    it('should correctly create a leading tick on drag start', () => {
      // Set start time o 60 seconds;
      crytonStage.startTime = 60;
      timelineNode.konvaObject.fire('dragstart');

      const timemark = getLTickTimemark();
      expect(getLTick()).toBeTruthy();
      expect(timemark).toBeTruthy();
    });
  });
});
