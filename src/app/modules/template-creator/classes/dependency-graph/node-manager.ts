import { Observable, ReplaySubject, Subject } from 'rxjs';
import { DependencyGraph } from './dependency-graph';
import { NodeNameNotUniqueError } from './errors/node-name-not-unique.error';
import { GraphNode } from './node/graph-node';
import { StageNode } from './node/stage-node';

export class NodeManager {
  /**
   * Triggers when a node is edited moved to editor.
   */
  editNode$: Observable<GraphNode>;
  moveToDispenser$: Observable<GraphNode>;
  nodes: GraphNode[] = [];

  private _editNode$ = new ReplaySubject<GraphNode>(1);
  private _moveToDispenser$ = new Subject<GraphNode>();
  private _depGraph: DependencyGraph;

  constructor(depGraph: DependencyGraph) {
    this._editNode$.next(null);
    this._depGraph = depGraph;
    this.editNode$ = this._editNode$.asObservable();
    this.moveToDispenser$ = this._moveToDispenser$.asObservable();
  }

  /**
   * Emits empty value from editNode$, prevents emitting old values.
   */
  clearEditNode(): void {
    this._editNode$.next(null);
  }

  /**
   * Moves a node from the canvas to the dispenser.
   *
   * @param node Node to move.
   */
  moveToDispenser(node: GraphNode): void {
    this.removeNode(node);
    this._moveToDispenser$.next(node);
    node.setParentDepGraph(null);
  }

  /**
   * Emits edit node event.
   *
   * @param node Node to edit.
   */
  editNode(node: GraphNode): void {
    this._editNode$.next(node);
  }

  /**
   * Removes node from the node manager.
   *
   * @param node Node to remove.
   */
  removeNode(node: GraphNode): void {
    this.nodes = this.nodes.filter(s => s !== node);
  }

  /**
   * Adds node to the dependency graph.
   *
   * @param node Node to add.
   */
  addNode(nodeToAdd: GraphNode): void {
    if (this.nodes.map(node => node.name).includes(nodeToAdd.name)) {
      throw new NodeNameNotUniqueError(nodeToAdd.name);
    }

    nodeToAdd.setParentDepGraph(this._depGraph);
    this.nodes.push(nodeToAdd);
    this._depGraph.addNode(nodeToAdd);

    if (nodeToAdd instanceof StageNode && nodeToAdd.timelineNode) {
      nodeToAdd.timeline.addNode(nodeToAdd.timelineNode);
    }
  }

  /**
   * Checks if node name is unique.
   *
   * @param name Node name.
   * @param editedNodeName Doesn't check this name if provided.
   * @returns True if node name is unique.
   */
  isNodeNameUnique(name: string, editedNodeName?: string): boolean {
    for (const node of this.nodes) {
      if (node.name !== editedNodeName && node.name === name) {
        return false;
      }
    }
    return true;
  }
}
