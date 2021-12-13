import { Observable, ReplaySubject, Subject } from 'rxjs';
import { DependencyTree } from './dependency-tree';
import { StageNode } from './node/stage-node';
import { TreeNode } from './node/tree-node';

export class NodeManager {
  /**
   * Triggers when a node is edited moved to editor.
   */
  editNode$: Observable<TreeNode>;
  moveToDispenser$: Observable<TreeNode>;
  nodes: TreeNode[] = [];

  private _editNode$ = new ReplaySubject<TreeNode>(1);
  private _moveToDispenser$ = new Subject<TreeNode>();
  private _depTree: DependencyTree;

  constructor(depTree: DependencyTree) {
    this._editNode$.next(null);
    this._depTree = depTree;
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
  moveToDispenser(node: TreeNode): void {
    this.removeNode(node);
    this._moveToDispenser$.next(node);
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
   * Removes node from the dependency tree.
   *
   * @param node Node to remove.
   */
  removeNode(node: TreeNode): void {
    this.nodes = this.nodes.filter(s => s !== node);
  }

  /**
   * Adds node to the dependency tree.
   *
   * @param node Node to add.
   */
  addNode(node: TreeNode): void {
    this.nodes.push(node);
    this._depTree.addNode(node);

    if (node instanceof StageNode && node.timelineNode) {
      node.timeline.addNode(node.timelineNode);
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
