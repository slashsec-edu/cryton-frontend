import Konva from 'konva';
import { LineConfig } from 'konva/types/shapes/Line';

export interface VLineConfig extends Omit<LineConfig, 'points'> {
  topY: number;
  bottomY: number;
}

export class VerticalLine extends Konva.Line {
  constructor(config: VLineConfig) {
    super({
      points: [0, config.topY, 0, config.bottomY],
      strokeWidth: (config.strokeWidth as number) ?? 1,
      listening: (config.listening as boolean) ?? false,
      ...config
    });
  }

  setTop(topY: number): void {
    this._setPoint(1, topY);
  }

  setBottom(bottomY: number): void {
    this._setPoint(3, bottomY);
  }

  private _setPoint(index: number, value: number): void {
    const newPoints = [...this.points()];
    newPoints[index] = value;
    this.points(newPoints);
  }
}
