import Konva from 'konva';
import { RippleAnimation } from '../../animations/ripple.animation';

export class NodeConnector {
  konvaObject = new Konva.Group();
  connectorCircle: Konva.Circle;
  rippleCircle: Konva.Circle;
  rippleAnimation: RippleAnimation;

  constructor(nodeWidth: number, nodeHeight: number) {
    this.rippleCircle = new Konva.Circle({
      x: nodeWidth / 2,
      y: nodeHeight,
      radius: 0,
      fill: '#979797',
      opacity: 0.2
    });

    this.connectorCircle = new Konva.Circle({
      radius: 7,
      fill: '#ff5543',
      hitStrokeWidth: 10,
      x: nodeWidth / 2,
      y: nodeHeight
    });

    this.konvaObject.add(this.rippleCircle);
    this.konvaObject.add(this.connectorCircle);
  }

  /**
   * Animates ripple around the connector.
   *
   * @param maxRadius Maximal radius the ripple can reach.
   * @param defaultOpacity Opacity in the default state.
   */
  animateRipple(maxRadius: number, defaultOpacity: number): void {
    this.rippleAnimation.animate(maxRadius, defaultOpacity);
  }

  /**
   * Unanimates the ripple if the animation didn't end properly.
   */
  unanimateRipple(): void {
    this.rippleAnimation.unanimate();
  }
}
