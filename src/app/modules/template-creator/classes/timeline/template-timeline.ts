import { TimelineNode } from './timeline-node';
import { TimelineEdge } from './timeline-edge';
import { ToolState } from './tool-state';
import { Subject } from 'rxjs';
import { NodeOrganizer } from '../utils/node-organizer';
import { OrganizerNodeType } from '../utils/node-organizer';
import { Timeline } from 'src/app/modules/shared/classes/timeline';
import { NodeMover } from './node-mover';
import { StageNode } from '../dependency-graph/node/stage-node';

export class TemplateTimeline extends Timeline {
  nodeOrganizer = new NodeOrganizer(OrganizerNodeType.TIMELINE);
  nodeMover = new NodeMover(this);
  toolState = new ToolState();

  openNodeParams$ = new Subject<StageNode>();
  selectedNodes = new Set<TimelineNode>();

  private _nodes: TimelineNode[] = [];
  private _edges: TimelineEdge[] = [];

  constructor() {
    super(false, true);
  }

  /**
   * @returns All nodes from the timeline.
   */
  getNodes(): TimelineNode[] {
    return [...this._nodes];
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
   * Removes references to a node from the timeline.
   *
   * @param node Node to be removed.
   */
  removeNode(node: TimelineNode): void {
    const nodeIndex = this._nodes.indexOf(node);

    if (nodeIndex !== -1) {
      this._nodes.splice(nodeIndex, 1);
    }
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

  /**
   * @returns All edges from the timeline.
   */
  getEdges(): TimelineEdge[] {
    return [...this._edges];
  }

  /**
   * Creates a new timeline edge between parent and child node.
   *
   * @param parent Parent node.
   * @param child Child node.
   * @returns Created edge.
   */
  createEdge(parent: TimelineNode, child: TimelineNode): TimelineEdge {
    const edge = new TimelineEdge(this, parent, child);
    this._addEdge(edge);

    return edge;
  }

  /**
   * Removes a node between parent and child.
   *
   * @param parent Parent node.
   * @param child Child node.
   */
  removeEdge(parent: TimelineNode, child: TimelineNode): void {
    const edge = this.findEdge(parent, child);
    if (edge) {
      this._removeEdge(edge);
    }
  }

  /**
   * Finds an edge with a specified parent and child.
   *
   * @param parent Parent node.
   * @param child Child node.
   * @returns Edge with a specified parent and child.
   */
  findEdge(parent: TimelineNode, child: TimelineNode): TimelineEdge {
    return this._edges.find(edge => edge.parentNode === parent && edge.childNode === child);
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
    this._edges.forEach(edge => edge.changeTheme(this.theme));
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

  /**
   * Adds new edge to the plan layer and redraws it.
   *
   * @param edge Edge to be added.
   */
  private _addEdge(edge: TimelineEdge): void {
    this.mainLayer.add(edge.konvaObject);
    this._edges.push(edge);
    edge.konvaObject.moveToBottom();
    this.nodeOrganizer.organizeGraph(edge.parentNode);
    this.mainLayer.draw();
  }

  private _removeEdge(edge: TimelineEdge): void {
    const edgeIndex = this._edges.indexOf(edge);

    if (edgeIndex !== -1) {
      this._edges.splice(this._edges.indexOf(edge), 1);
    }
    edge.destroy();
  }
}
