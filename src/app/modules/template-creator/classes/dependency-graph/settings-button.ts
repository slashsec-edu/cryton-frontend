import Konva from 'konva';
import { RippleAnimation } from '../../animations/ripple.animation';
import { Cursor } from './cursor-state';
import { DependencyGraph } from './dependency-graph';

/**
 * Width of settings button area.
 */
export const SETTINGS_BTN_WIDTH = 24;

/**
 * Click and ripple radius of settings button (not the actual cogwheel).
 */
export const SETTINGS_BTN_RADIUS = 16;

/**
 * Left-side padding of setting button.
 */
export const SETTINGS_BTN_PADDING = 10;

export const SETTINGS_BTN_NAME = 'nodeSettingsBtn';

/**
 * Cogwheel svg path.
 */
const COGWHEEL_PATH = `M19.5,12c0-0.23-0.01-0.45-0.03-0.68l1.86-1.41c0.4-0.3,0.51-0.86,
  0.26-1.3l-1.87-3.23c-0.25-0.44-0.79-0.62-1.25-0.42 l-2.15,
  0.91c-0.37-0.26-0.76-0.49-1.17-0.68l-0.29-2.31C14.8,
  2.38,14.37,2,13.87,2h-3.73C9.63,2,9.2,2.38,9.14,2.88L8.85,5.19
  c-0.41,0.19-0.8,0.42-1.17,0.68L5.53,4.96c-0.46-0.2-1-0.02-1.25,
  0.42L2.41,8.62c-0.25,0.44-0.14,0.99,0.26,1.3l1.86,1.41 C4.51,11.55,
  4.5,11.77,4.5,12s0.01,0.45,0.03,0.68l-1.86,1.41c-0.4,0.3-0.51,
  0.86-0.26,1.3l1.87,3.23c0.25,0.44,0.79,0.62,1.25,0.42 l2.15-0.91c0.37,
  0.26,0.76,0.49,1.17,0.68l0.29,2.31C9.2,21.62,9.63,22,10.13,22h3.73c0.5,
  0,0.93-0.38,0.99-0.88l0.29-2.31 c0.41-0.19,0.8-0.42,1.17-0.68l2.15,
  0.91c0.46,0.2,1,0.02,1.25-0.42l1.87-3.23c0.25-0.44,
  0.14-0.99-0.26-1.3l-1.86-1.41 C19.49,12.45,19.5,12.23,19.5,12z
  M12.04,15.5c-1.93,0-3.5-1.57-3.5-3.5s1.57-3.5,3.5-3.5s3.5,1.57,
  3.5,3.5S13.97,15.5,12.04,15.5z`;

export class SettingsButton {
  konvaObject = new Konva.Group({ name: SETTINGS_BTN_NAME });
  rippleAnimation: RippleAnimation;
  rippleCircle: Konva.Circle;

  private _dependencyGraph: DependencyGraph;
  private _stepHeight: number;

  constructor(dependencyGraph: DependencyGraph, stepHeight: number) {
    this._dependencyGraph = dependencyGraph;
    this._stepHeight = stepHeight;

    const iconCenterX = SETTINGS_BTN_PADDING + SETTINGS_BTN_WIDTH / 2;
    const iconCenterY = this._stepHeight / 2;

    const backgroundCircle = new Konva.Circle({
      radius: SETTINGS_BTN_RADIUS,
      x: iconCenterX,
      y: iconCenterY
    });
    this.rippleCircle = new Konva.Circle({
      radius: 0,
      x: iconCenterX,
      y: iconCenterY,
      fill: '#49565e'
    });

    const cogwheelPath = this._createCogwheelPath();

    this.konvaObject.add(backgroundCircle);
    this.konvaObject.add(this.rippleCircle);
    this.konvaObject.add(cogwheelPath);

    this._initEventListeners();
    this.rippleAnimation = new RippleAnimation(this.rippleCircle, dependencyGraph.graphLayer);
  }

  /**
   * Creates a cogwheel shaped path object.
   */
  private _createCogwheelPath(): Konva.Path {
    const iconHeight = 24;
    const paddingSpace = this._stepHeight - iconHeight;
    const y = paddingSpace / 2;

    const cogwheel = new Konva.Path({
      x: SETTINGS_BTN_PADDING,
      y,
      data: COGWHEEL_PATH,
      fill: 'white',
      hitFunc: (context: Konva.Context, shape: Konva.Shape) => {
        context.beginPath();
        context.arc(SETTINGS_BTN_PADDING, y, SETTINGS_BTN_RADIUS, 0, 2 * Math.PI, true);
        context.closePath();
        context.fillStrokeShape(shape);
      }
    });

    return cogwheel;
  }

  /**
   * Initializes hover events.
   */
  private _initHoverEvents(): void {
    this.konvaObject.on('mouseenter', () => {
      this._dependencyGraph.cursorState.setCursor(Cursor.POINTER);
    });
    this.konvaObject.on('mouseleave', () => {
      this._dependencyGraph.cursorState.unsetCursor(Cursor.POINTER);
    });
  }

  /**
   * Initializes ripple event.
   */
  private _initRippleEvents(): void {
    this.konvaObject.on('mousedown', () => this.rippleAnimation.animate(SETTINGS_BTN_RADIUS, 1));
    this.konvaObject.on('mouseup mouseleave', () => this.rippleAnimation.unanimate());
  }

  /**
   * Initializes all event listeners.
   */
  private _initEventListeners() {
    this._initHoverEvents();
    this._initRippleEvents();
  }
}
