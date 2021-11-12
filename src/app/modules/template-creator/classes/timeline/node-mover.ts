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

    if (this._timeline.toolState.isTreeMoveEnabled) {
      NodeOrganizer.moveTree(draggedNode, 0, yIncrement);
    } else if (this._timeline.selectedNodes.size > 0) {
      this._moveSelectedNodes(draggedNode, 0, yIncrement);
    } else if (yIncrement !== 0) {
      this._moveChildNSNodes(draggedNode, 0, yIncrement);
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
    if (draggedNode.crytonNode.trigger.getStartTime() === null) {
      return {
        x: draggedNode.konvaObject.absolutePosition().x,
        y: draggedNode.konvaObject.absolutePosition().y
      };
    }
    const modTickWidth = (pos.x - draggedNode.crytonNode.timeline.timelinePadding[3]) % TICK_WIDTH;
    const stageXModTickWidth = this._timeline.stageX % TICK_WIDTH;

    // Calculate X coordinate of closest tick to mouse position.
    let newX = modTickWidth < Math.floor(TICK_WIDTH / 2) ? pos.x - modTickWidth : pos.x + (TICK_WIDTH - modTickWidth);

    // Node gets moved away to the side by this value from the tick when stageX > 0.
    newX += stageXModTickWidth;

    const oldX = draggedNode.konvaObject.absolutePosition().x;

    if (newX - this._timeline.stageX < draggedNode.crytonNode.timeline.timelinePadding[3]) {
      newX = draggedNode.crytonNode.timeline.timelinePadding[3];
    }

    // We care about the position on the stage, not on the layer.
    const newSeconds = TimelineUtils.calcSecondsFromX(newX - this._timeline.stageX, this._timeline.getParams());

    try {
      draggedNode.checkTriggerStart(newSeconds);
      draggedNode.crytonNode.trigger.setStartTime(newSeconds);
    } catch (e) {
      newX = oldX;
    }

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
   * Makes sure that all of the dependant nodes are updated as well.
   *
   * @param draggedNode Dragged template timeline node.
   * @param xIncrement X increment.
   */
  private _moveHorizontally(draggedNode: TimelineNode, xIncrement: number): void {
    if (xIncrement === 0) {
      return;
    }
    if (this._timeline.toolState.isTreeMoveEnabled) {
      NodeOrganizer.moveTree(draggedNode, xIncrement, 0);
    } else if (draggedNode.selected && this._timeline.selectedNodes.size > 0) {
      this._moveSelectedNodes(draggedNode, xIncrement, 0);
    } else {
      this._moveChildNSNodes(draggedNode, xIncrement, 0);
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
    const movedNodes: TimelineNode[] = [];
    const uniqueNSNodes = new Set<TimelineNode>();

    this._timeline.selectedNodes.forEach(node => {
      if (xIncrement && node.x + xIncrement >= draggedNode.crytonNode.timeline.timelinePadding[3]) {
        try {
          node.checkTriggerStart(TimelineUtils.calcSecondsFromX(node.x + xIncrement, this._timeline.getParams()));
          if (node.crytonNode.trigger.getStartTime() === null) {
            uniqueNSNodes.add(node);
          } else {
            node.x += xIncrement;
            movedNodes.push(node);
          }
        } catch (e) {}
      }
      if (yIncrement) {
        if (node !== draggedNode) {
          node.y += yIncrement;
        }
        movedNodes.push(node);
      }
    });

    try {
      draggedNode.checkTriggerStart(
        TimelineUtils.calcSecondsFromX(draggedNode.x + xIncrement, this._timeline.getParams())
      );
      movedNodes.push(draggedNode);
    } catch (e) {}

    movedNodes.forEach(node => {
      const childHttpNodes = this._findAllChildNSNodes(node);
      childHttpNodes.forEach(childNode => {
        if (!this._timeline.selectedNodes.has(childNode)) {
          uniqueNSNodes.add(childNode);
        }
      });
    });

    uniqueNSNodes.forEach(node => {
      node.x += xIncrement;
      node.y += yIncrement;
    });
  }

  /**
   * Finds all NS nodes in a tree with a given root node.
   *
   * @param rootNode Root node of a tree.
   * @returns NS nodes.
   */
  private _findAllChildNSNodes(rootNode: TimelineNode): TimelineNode[] {
    const nodes: TimelineNode[] = [];

    rootNode.childEdges.forEach(childEdge => {
      if (childEdge.childNode.crytonNode.trigger.getStartTime() === null) {
        nodes.push(...this._findAllChildNSNodesHelper(childEdge.childNode));
      }
    });

    return nodes;
  }

  private _findAllChildNSNodesHelper(rootNode: TimelineNode, visited = new Set<TimelineNode>()) {
    if (visited.has(rootNode)) {
      return [];
    }

    if (rootNode.crytonNode.trigger.getStartTime() === null) {
      visited.add(rootNode);

      rootNode.childEdges.forEach(edge => {
        this._findAllChildNSNodesHelper(edge.childNode, visited);
      });
    }

    return visited;
  }

  private _moveChildNSNodes(rootNode: TimelineNode, xIncrement: number, yIncrement: number): void {
    rootNode.childEdges.forEach(edge => {
      if (edge.childNode.crytonNode.trigger.getStartTime() === null) {
        edge.childNode.x += xIncrement;
        edge.childNode.y += yIncrement;

        this._moveChildNSNodes(edge.childNode, xIncrement, yIncrement);
      }
    });
  }
}
