import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { CrytonNode } from '../cryton-node/cryton-node';
import { CrytonStage } from '../cryton-node/cryton-stage';

export class NodeManager {
  /**
   * Triggers when a node is edited moved to editor.
   */
  editNode$: Observable<CrytonNode>;
  dispenserNodes$: Observable<CrytonNode[]>;
  canvasNodes: CrytonNode[] = [];

  private _editNode$ = new ReplaySubject<CrytonNode>(1);
  private _dispenserNodes$ = new BehaviorSubject<CrytonNode[]>([]);

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
  getAllNodes(): CrytonNode[] {
    const allNodes = [...this.canvasNodes];
    allNodes.push(...this._dispenserNodes$.value);
    return allNodes;
  }

  /**
   * Moves a node from the canvas to the dispenser.
   *
   * @param node Node to move.
   */
  moveToDispenser(node: CrytonNode): void {
    this.removeCanvasNode(node);
    this._dispenserNodes$.next(this._dispenserNodes$.value.concat(node));
  }

  /**
   * Moves a node from the dispenser to the canvas.
   *
   * @param node Node to move.
   */
  moveToPlan(node: CrytonNode): void {
    this.removeDispenserNode(node);
    this.canvasNodes.push(node);
    node.parentDepTree.addNode(node);

    if (node instanceof CrytonStage) {
      node.timeline.addNode(node.timelineNode);
    }
  }

  /**
   * Emits edit node event.
   *
   * @param node Node to edit.
   */
  editNode(node: CrytonNode): void {
    this._editNode$.next(node);
  }

  /**
   * Removes node from the dispenser.
   *
   * @param node Node to remove.
   */
  removeDispenserNode(node: CrytonNode): void {
    const withoutNode = this._dispenserNodes$.value.filter(s => s !== node);
    this._dispenserNodes$.next(withoutNode);
  }

  /**
   * Removes node from the canvas.
   *
   * @param node Node to remove.
   */
  removeCanvasNode(node: CrytonNode): void {
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
