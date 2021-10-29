import Konva from 'konva';
import { LineCap } from 'konva/types/Shape';

export class StrokeAnimation {
  private _strokedShape: Konva.Shape;
  private _listenerNode: Konva.Node;
  private _layer: Konva.Layer;

  private _defaultColor: string;
  private _defaultStrokeWidth: number;
  private _defaultLineCap: LineCap;
  private _defaultFill: string;

  private _animation: Konva.Animation;

  constructor(strokedShape: Konva.Shape, listenerNode: Konva.Node, layer: Konva.Layer) {
    this._strokedShape = strokedShape;
    this._listenerNode = listenerNode;
    this._layer = layer;
  }

  /**
   * Activates stroke animation.
   *
   * @param color Color of the stroke.
   */
  activate(color: string): void {
    this._saveDefaults();
    this._strokedShape.strokeEnabled(true);
    this._strokedShape.stroke(color);
    this._strokedShape.strokeWidth(3);
    this._strokedShape.lineCap('round');
    this._strokedShape.dash([12, 10]);

    if (this._strokedShape instanceof Konva.Arrow) {
      this._strokedShape.fill(color);
    }

    this._animation = new Konva.Animation(frame => {
      this._strokedShape.dashOffset(Math.round(frame.time / 20));
    }, this._layer);

    this._animation.start();

    this._listenerNode.on('mouseleave', () => {
      this.deactivate();
    });
  }

  /**
   * Deactivates stroke animation.
   */
  deactivate(): void {
    if (this._strokedShape instanceof Konva.Arrow) {
      this._strokedShape.stroke(this._defaultColor);
      this._strokedShape.strokeWidth(this._defaultStrokeWidth);
      this._strokedShape.lineCap(this._defaultLineCap);
      this._strokedShape.fill(this._defaultFill);
      this._strokedShape.dash([]);
    } else {
      this._strokedShape.strokeEnabled(false);
    }

    this._layer.draw();
    this._animation?.stop();
  }

  /**
   * Saves default stroke and color settings before activating animation.
   */
  private _saveDefaults(): void {
    this._defaultColor = this._strokedShape.stroke();
    this._defaultStrokeWidth = this._strokedShape.strokeWidth();
    this._defaultLineCap = this._strokedShape.lineCap();
    this._defaultFill = this._strokedShape.fill();
  }
}
