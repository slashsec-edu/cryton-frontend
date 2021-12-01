import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { StageNode } from './node/stage-node';
import { TreeNode } from './node/tree-node';

export class NodeManager {
  /**
   * Triggers when a node is edited moved to editor.
   */
  editNode$: Observable<TreeNode>;
  dispenserNodes$: Observable<TreeNode[]>;
  canvasNodes: TreeNode[] = [];

  private _editNode$ = new ReplaySubject<TreeNode>(1);
  private _dispenserNodes$ = new BehaviorSubject<TreeNode[]>([]);

  constructor() {
    this._editNode$.next(null);
    this.editNode$ = this._editNode$.asObservable();
    this.dispenserNodes$ = this._dispenserNodes$.asObservable();
  }

  /**
   * Emits empty value from editNode$, prevents emitting old values.
   */
  clearEditNode(): void {
    this._editNode$.next(null);
  }

  /**
   * Returns an array of all nodes which manager remembers.
   *
   * @returns Array of nodes.
   */
  getAllNodes(): TreeNode[] {
    const allNodes = [...this.canvasNodes];
    allNodes.push(...this._dispenserNodes$.value);
    return allNodes;
  }

  /**
   * Moves a node from the canvas to the dispenser.
   *
   * @param node Node to move.
   */
  moveToDispenser(node: TreeNode): void {
    this.removeCanvasNode(node);
    this._dispenserNodes$.next(this._dispenserNodes$.value.concat(node));
  }

  /**
   * Moves a node from the dispenser to the canvas.
   *
   * @param node Node to move.
   */
  moveToPlan(node: TreeNode): void {
    this.removeDispenserNode(node);
    this.canvasNodes.push(node);
    node.parentDepTree.addNode(node);

    if (node instanceof StageNode && node.timelineNode) {
      node.timeline.addNode(node.timelineNode);
    }
  }

  /**
   * Emits edit node event.
   *
   * @param node Node to edit.
   */
  editNode(node: TreeNode): void {
    this._editNode$.next(node);
  }

  /**
   * Removes node from the dispenser.
   *
   * @param node Node to remove.
   */
  removeDispenserNode(node: TreeNode): void {
    const withoutNode = this._dispenserNodes$.value.filter(s => s !== node);
    this._dispenserNodes$.next(withoutNode);
  }

  /**
   * Removes node from the canvas.
   *
   * @param node Node to remove.
   */
  removeCanvasNode(node: TreeNode): void {
    this.canvasNodes = this.canvasNodes.filter(s => s !== node);
  }

  /**
   * Checks if node name is unique.
   *
   * @param name Node name.
   * @param editedNodeName Doesn't check this name if provided.
   * @returns True if node name is unique.
   */
  isNodeNameUnique(name: string, editedNodeName?: string): boolean {
    for (const node of this.getAllNodes()) {
      if (node.name !== editedNodeName && node.name === name) {
        return false;
      }
    }
    return true;
  }
}
