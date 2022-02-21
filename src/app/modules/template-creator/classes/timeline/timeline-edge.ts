import Konva from 'konva';
import { Theme } from '../../models/interfaces/theme';
import { Vector } from '../utils/vector';
import { TemplateTimeline } from './template-timeline';
import { EDGE_ARROW_NAME } from './timeline-edge-constants';
import { TimelineNode } from './timeline-node';
import { NODE_RADIUS } from './timeline-node-constants';

export class TimelineEdge {
  konvaObject: Konva.Arrow;
  timeline: TemplateTimeline;

  parentNode: TimelineNode;
  childNode: TimelineNode;

  private _edgeColor: string;

  constructor(timeline: TemplateTimeline, parentNode: TimelineNode, childNode: TimelineNode) {
    this.timeline = timeline;
    this.parentNode = parentNode;
    this.childNode = childNode;

    parentNode.childEdges.push(this);
    childNode.parentEdges.push(this);

    this._initKonvaObject();
  }

  set color(value: string) {
    this.konvaObject.stroke(value);
    this.konvaObject.fill(value);
  }

  /**
   * Updates edge points.
   */
  updatePoints(): void {
    const newPoints = this._generatePoints();

    if (newPoints[2] - newPoints[0] < 0) {
      this.color = 'red';
    } else {
      this.color = this._edgeColor;
    }

    this.konvaObject.points(newPoints);
  }

  /**
   * Changes edge theme.
   *
   * @param theme New theme.
   */
  changeTheme(theme: Theme): void {
    this._edgeColor = theme.templateCreator.timelineEdge;

    const edgePoints = this.konvaObject.points();

    if (edgePoints[2] - edgePoints[0] >= 0) {
      this.color = theme.templateCreator.timelineEdge;
    }
  }

  destroy(): void {
    this.konvaObject.destroy();
    this.parentNode.removeChildEdge(this);
    this.childNode.removeParentEdge(this);
    this.konvaObject = null;
    this.parentNode = null;
    this.childNode = null;
    this.timeline = null;
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
      shadowForStrokeEnabled: false,
      name: EDGE_ARROW_NAME
    });

    if (this.timeline.theme) {
      this.changeTheme(this.timeline.theme);
    }
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
      return origin;
    }
    v = v.normalize();
    return origin.add(v.multiplyScalar(radius));
  }
}
