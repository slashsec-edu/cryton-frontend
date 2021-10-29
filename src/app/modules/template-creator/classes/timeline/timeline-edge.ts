import Konva from 'konva';
import { CrytonStageEdge } from '../cryton-edge/cryton-stage-edge';
import { TemplateTimeline } from './template-timeline';
import { TimelineNode } from './timeline-node';
import { NS_EDGE_DASH, NODE_RADIUS } from './timeline-node-constants';
import { Vector } from '../utils/vector';
import { Theme } from '../../models/interfaces/theme';

export class TimelineEdge {
  crytonEdge: CrytonStageEdge;
  konvaObject: Konva.Arrow;

  constructor(crytonEdge: CrytonStageEdge) {
    this.crytonEdge = crytonEdge;
    this._initKonvaObject();
  }

  get parentNode(): TimelineNode {
    return this.crytonEdge.parentNode.timelineNode;
  }

  get childNode(): TimelineNode {
    return this.crytonEdge.childNode.timelineNode;
  }

  get timeline(): TemplateTimeline {
    return this.crytonEdge.timeline;
  }

  set color(value: string) {
    this.konvaObject.stroke(value);
    this.konvaObject.fill(value);
  }

  /**
   * Updates edge points.
   */
  updatePoints(): void {
    this.konvaObject.points(this._generatePoints());
  }

  updateEdgeStyle(): void {
    if (!this.childNode.crytonNode.trigger.getStartTime()) {
      this._addDash();
    } else {
      this._removeDash();
    }
  }

  /**
   * Changes edge theme.
   *
   * @param theme New theme.
   */
  changeTheme(theme: Theme): void {
    this.color = theme.templateCreator.timelineEdge;
  }

  /**
   * Initializes konva object and sets up event listener functions.
   */
  private _initKonvaObject(): void {
    this.konvaObject = new Konva.Arrow({
      points: this._generatePoints(),
      strokeWidth: 2,
      pointerWidth: 4,
      pointerLength: 6,
      hitStrokeWidth: 10,
      shadowForStrokeEnabled: false
    });

    if (this.timeline.theme) {
      this.changeTheme(this.timeline.theme);
    }

    if (this.childNode.crytonNode.trigger.getStartTime() === null) {
      this.konvaObject.dash(NS_EDGE_DASH);
    }

    this.konvaObject.on('mouseenter', e => {
      e.cancelBubble = true;
      this.timeline.cursorState.resetCursor();
      this.color = this.timeline.theme.templateCreator.timelineEdgeHover;
      this.konvaObject.moveToBottom();
      this.timeline.stage.draw();
    });

    this.konvaObject.on('mouseleave', e => {
      e.cancelBubble = true;
      this.timeline.cursorState.resetCursor();
      this.changeTheme(this.timeline.theme);
      this.konvaObject.moveToBottom();
      this.timeline.stage.draw();
    });
  }

  /**
   * Generates edge points in the form [parent x, parent y, child x, child y],
   * where each of these points lay at the intersection of the line from the center of
   * the parent to the center of the child and the node circles.
   *
   * @returns Array of point coordinates.
   */
  private _generatePoints(): number[] {
    const parentIntersect = this._findIntersect(
      new Vector(this.parentNode.x, this.parentNode.y),
      NODE_RADIUS,
      new Vector(this.childNode.x, this.childNode.y)
    );

    const childIntersect = this._findIntersect(
      new Vector(this.childNode.x, this.childNode.y),
      NODE_RADIUS,
      new Vector(this.parentNode.x, this.parentNode.y)
    );

    return [parentIntersect.x, parentIntersect.y, childIntersect.x, childIntersect.y];
  }

  /**
   * Finds the intersection of a line starting at the origin and ending at the endPoint and a
   * circle with a center at the origin with a given radius.
   *
   * @param origin Origin point of the line and the center of the circle.
   * @param radius Circle radius.
   * @param endPoint End point of the line.
   * @returns Intersection point.
   */
  private _findIntersect(origin: Vector, radius: number, endPoint: Vector): Vector {
    let v = endPoint.subtract(origin);
    const lineLength = v.length();
    if (lineLength === 0) {
      throw new Error('Length has to be positive');
    }
    v = v.normalize();
    return origin.add(v.multiplyScalar(radius));
  }

  /**
   * Removes dash from the edge.
   */
  private _removeDash(): void {
    this.konvaObject.dash([]);
  }

  /**
   * Adds dash to the edge.
   */
  private _addDash(): void {
    this.konvaObject.dash(NS_EDGE_DASH);
  }
}
