import { TimelineNode } from './timeline-node';
import { CrytonStage } from '../cryton-node/cryton-stage';
import { TimelineEdge } from './timeline-edge';
import { ToolState } from './tool-state';
import { Subject } from 'rxjs';
import { NodeOrganizer } from '../utils/node-organizer';
import { NodeType } from '../utils/node-organizer';
import { Timeline } from 'src/app/modules/shared/classes/timeline';
import { NodeMover } from './node-mover';

export class TemplateTimeline extends Timeline {
  nodeOrganizer = new NodeOrganizer(NodeType.TIMELINE);
  nodeMover = new NodeMover(this);
  toolState = new ToolState();

  openNodeParams$ = new Subject<CrytonStage>();
  selectedNodes = new Set<TimelineNode>();

  private _nodes: TimelineNode[] = [];

  constructor() {
    super(false, true);
  }

  /**
   * Adds new node to the plan layer and redraws it.
   *
   * @param node Node to be added.
   */
  addNode(node: TimelineNode): void {
    this.mainLayer.add(node.konvaObject);
    this._nodes.push(node);
    this.mainLayer.draw();
  }

  /**
   * Adds new edge to the plan layer and redraws it.
   *
   * @param edge Edge to be added.
   */
  addEdge(edge: TimelineEdge): void {
    this.mainLayer.add(edge.konvaObject);
    edge.konvaObject.moveToBottom();
    this.nodeOrganizer.organizeTree(edge.parentNode);
    this.mainLayer.draw();
  }

  /**
   * Removes references to a node from the timeline.
   *
   * @param node Node to be removed.
   */
  removeNode(node: TimelineNode): void {
    const nodeIndex = this._nodes.indexOf(node);
    this._nodes.splice(nodeIndex, 1);
    this.selectedNodes.delete(node);
  }

  /**
   * Visually organizes timeline nodes.
   */
  organizeNodes(): void {
    this.nodeOrganizer.organizeNodes(this._nodes);
    this.mainLayer.y(this.height / 2);
    this.stage.draw();
  }

  protected _handleTickSecondsChange(): void {
    this._recalculateNodePositions();
    super._handleTickSecondsChange();
  }

  /**
   * Refreshes timeline color theme.
   */
  protected _refreshTheme(): void {
    super._refreshTheme();
    this._nodes.forEach(node => node.changeTheme(this.theme));
    this._getAllEdges().forEach(edge => edge.changeTheme(this.theme));
    this.stage.draw();
  }

  /**
   * Initializes konva stage events.
   */
  protected _initKonvaEvents(): void {
    super._initKonvaEvents();
    this.stage.on('click', e => {
      if (!e.evt.shiftKey) {
        this.selectedNodes.forEach(node => node.deselect());
      }
    });
  }

  /**
   * Gets all timeline nodes in the timeline.
   *
   * @returns Array of timeline nodes.
   */
  private _getAllEdges(): TimelineEdge[] {
    const edges: TimelineEdge[] = [];

    this._nodes.forEach(node => edges.push(...node.childEdges));
    return edges;
  }

  /**
   * Recalculates all node positions.
   * Has to recalculate positions in order from nodes with smallest x to the biggest
   * because they may depend on each other.
   */
  private _recalculateNodePositions(): void {
    this._nodes
      .sort((a, b) => a.x - b.x)
      .forEach(node => {
        node.updateX();
      });
  }
}
