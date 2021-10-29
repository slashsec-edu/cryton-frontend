export interface TimelineShape {
  updatePoints(params: TimelineParams): void;
}

export interface TimelineParams {
  tickSeconds: number;
  secondsAtZero: number;
  leftPadding: number;
}
