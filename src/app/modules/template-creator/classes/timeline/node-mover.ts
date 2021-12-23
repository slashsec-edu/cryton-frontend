import { Vector2d } from 'konva/types/types';
import { TICK_WIDTH } from 'src/app/modules/shared/classes/timeline-constants';
import { TimelineUtils } from 'src/app/modules/shared/classes/timeline-utils';
import { NodeOrganizer } from '../utils/node-organizer';
import { TemplateTimeline } from './template-timeline';
import { TimelineNode } from './timeline-node';

export class NodeMover {
  private _timeline: TemplateTimeline;

  constructor(timeline: TemplateTimeline) {
    this._timeline = timeline;
  }

  /**
   * Node drag function for the template timeline node.
   *
   * @param draggedNode Dragged template timeline node.
   * @param pos Position of the node.
   * @returns New position of the node.
   */
  nodeDragFunc = (draggedNode: TimelineNode, pos: Vector2d): Vector2d => {
    if (this._timeline.toolState.isVerticalMoveEnabled) {
      return this._verticalDragFunc(draggedNode, pos);
    } else {
      return this._horizontalDragFunc(draggedNode, pos);
    }
  };

  /**
   * Node drag function for vertical dragging.
   *
   * @param draggedNode Dragged template timeline node.
   * @param pos Position of the node.
   * @returns New position of the node.
   */
  private _verticalDragFunc = (draggedNode: TimelineNode, pos: Vector2d): Vector2d => {
    const yIncrement = pos.y - draggedNode.konvaObject.absolutePosition().y;

    if (this._timeline.toolState.isGraphMoveEnabled) {
      NodeOrganizer.moveGraph(draggedNode, 0, yIncrement);
    } else if (this._timeline.selectedNodes.size > 0) {
      this._moveSelectedNodes(draggedNode, 0, yIncrement);
    }
    return {
      x: draggedNode.konvaObject.absolutePosition().x,
      y: pos.y
    };
  };

  /**
   * Node drag function for horizontal dragging.
   *
   * @param draggedNode Dragged template timeline node.
   * @param pos Position of the node.
   * @returns New position of the node.
   */
  private _horizontalDragFunc = (draggedNode: TimelineNode, pos: Vector2d): Vector2d => {
    const modTickWidth = (pos.x - draggedNode.timeline.timelinePadding[3]) % TICK_WIDTH;
    const stageXModTickWidth = this._timeline.stageX % TICK_WIDTH;

    // Calculate X coordinate of closest tick to mouse position.
    let newX = modTickWidth < Math.floor(TICK_WIDTH / 2) ? pos.x - modTickWidth : pos.x + (TICK_WIDTH - modTickWidth);

    // Node gets moved away to the side by this value from the tick when stageX > 0.
    newX += stageXModTickWidth;

    const oldX = draggedNode.konvaObject.absolutePosition().x;

    if (newX - this._timeline.stageX < draggedNode.timeline.timelinePadding[3]) {
      newX = draggedNode.timeline.timelinePadding[3];
    }

    // We care about the position on the stage, not on the layer.
    const newSeconds = TimelineUtils.calcSecondsFromX(newX - this._timeline.stageX, this._timeline.getParams());

    draggedNode.trigger.setStartTime(newSeconds);

    const xIncrement = newX - oldX;

    if (xIncrement !== 0) {
      this._moveHorizontally(draggedNode, xIncrement);
    }

    return {
      x: newX,
      y: draggedNode.konvaObject.absolutePosition().y
    };
  };

  /**
   * Method which is called when the node is moved horizontally in the drag bound function.
   * Makes sure that all of the dependent nodes are updated as well.
   *
   * @param draggedNode Dragged template timeline node.
   * @param xIncrement X increment.
   */
  private _moveHorizontally(draggedNode: TimelineNode, xIncrement: number): void {
    if (xIncrement === 0) {
      return;
    }
    if (this._timeline.toolState.isGraphMoveEnabled) {
      NodeOrganizer.moveGraph(draggedNode, xIncrement, 0);
    } else if (draggedNode.selected && this._timeline.selectedNodes.size > 0) {
      this._moveSelectedNodes(draggedNode, xIncrement, 0);
    }
  }

  /**
   * Moves all of the selected nodes by a given increment.
   *
   * @param draggedNode Dragged template timeline node.
   * @param xIncrement X increment.
   * @param yIncrement Y increment.
   */
  private _moveSelectedNodes(draggedNode: TimelineNode, xIncrement: number, yIncrement: number): void {
    this._timeline.selectedNodes.forEach(node => {
      if (xIncrement && node !== draggedNode && node.x + xIncrement >= draggedNode.timeline.timelinePadding[3]) {
        node.x += xIncrement;
      }
      if (yIncrement && node !== draggedNode) {
        node.y += yIncrement;
      }
    });
  }
}
