import { CrytonStageEdge } from '../cryton-edge/cryton-stage-edge';
import { CrytonStage } from '../cryton-node/cryton-stage';
import { TemplateTimeline } from './template-timeline';
import { TimelineNode } from './timeline-node';

class CrytonStageFake {
  name = 'Testing stage';
  childEdges: CrytonStageEdge[] = [];
  parentEdges: CrytonStageEdge[] = [];
  timeline = new TemplateTimeline();

  startTime = 0;

  trigger = {
    getStartTime: () => this.startTime,
    getTag: () => null
  };
}

describe('TimelineNode', () => {
  let timelineNode: TimelineNode;
  let crytonStage: CrytonStageFake;

  beforeEach(() => {
    crytonStage = new CrytonStageFake();
    timelineNode = new TimelineNode((crytonStage as unknown) as CrytonStage);
  });

  it('should create', () => {
    expect(timelineNode).toBeTruthy();
  });

  it('should initialize all konva elements correctly', () => {
    expect(timelineNode.konvaObject).toBeTruthy();

    const nodeCircle = timelineNode.konvaObject.find('KonvaCircle');
    expect(nodeCircle).toBeTruthy();
  });
});
