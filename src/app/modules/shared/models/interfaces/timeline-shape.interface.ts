import { TimelineParams } from './timeline-params.interface';

export interface TimelineShape {
  updatePoints(params: TimelineParams): void;
}
