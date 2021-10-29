import Konva from 'konva';

export class RippleAnimation {
  private _rippleCricle: Konva.Circle;
  private _layer: Konva.Layer;

  private _animation: Konva.Animation;

  // True if animation is currently unanimating.
  private _unanimating = false;
  private _duration = 150;

  private _defaultOpacity: number;
  private _maxRadius: number;

  constructor(rippleCircle: Konva.Circle, layer: Konva.Layer) {
    this._rippleCricle = rippleCircle;
    this._layer = layer;
  }

  /**
   * Animates ripple up to max radius.
   * Doesn't unanimate it back.
   *
   * @param maxRadius Maximal radius the ripple can reach.
   * @param defaultOpacity Default value of opacity.
   */
  animate(maxRadius: number, defaultOpacity: number): void {
    this._maxRadius = maxRadius;
    this._defaultOpacity = defaultOpacity;
    this._unanimating = false;

    this._animation?.stop();

    const radiusIncrement = maxRadius / this._duration;

    this._rippleCricle.opacity(defaultOpacity);
    this._rippleCricle.radius(0);

    const animation = new Konva.Animation(frame => {
      this._rippleCricle.radius(radiusIncrement * frame.time);

      if (frame.time >= this._duration) {
        this._rippleCricle.radius(maxRadius);
        animation.stop();
      }
    }, this._layer);

    this._animation = animation;
    animation.start();
  }

  /**
   * Unanimates ripple.
   */
  unanimate(): void {
    if (this._rippleCricle.radius() === 0 || this._unanimating) {
      return;
    }

    this._unanimating = true;
    const opacityDecrement = this._defaultOpacity / this._duration;
    let overtimeStart: number;

    const animation = new Konva.Animation(frame => {
      if (this._rippleCricle.radius() === this._maxRadius && !overtimeStart) {
        overtimeStart = frame.time;
      }
      if (overtimeStart && frame.time - overtimeStart >= 200) {
        this._animation = opacityAnimation;
        this._animation.start();
        animation.stop();
      }
    }, this._layer);

    const opacityAnimation = new Konva.Animation(frame => {
      this._rippleCricle.opacity(this._defaultOpacity - opacityDecrement * frame.time);

      if (frame.time >= this._duration) {
        this._rippleCricle.radius(0);
        this._rippleCricle.opacity(this._defaultOpacity);
        this._animation = null;
        this._unanimating = false;
        opacityAnimation.stop();
      }
    }, this._layer);

    this._animation = animation;
    animation.start();
  }
}
