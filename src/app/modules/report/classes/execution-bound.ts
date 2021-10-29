import { TimelineUtils } from '../../shared/classes/timeline-utils';
import { VerticalLine, VLineConfig } from '../../shared/classes/vertical-line';
import { TimelineParams, TimelineShape } from '../../shared/models/interfaces/timeline-shape.interface';

export interface ExecBoundConfig extends VLineConfig {
  startSeconds: number;
}

export class ExecutionBound extends VerticalLine implements TimelineShape {
  constructor(config: ExecBoundConfig) {
    super({
      stroke: 'red',
      strokeWidth: 2,
      ...config
    });
  }

  updatePoints(params: TimelineParams): void {
    const { startSeconds } = this.getAttrs() as ExecBoundConfig;

    this.x(TimelineUtils.calcXFromSeconds(startSeconds, params));
  }
}
