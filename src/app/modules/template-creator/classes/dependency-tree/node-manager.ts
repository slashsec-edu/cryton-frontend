import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { CrytonNode } from '../cryton-node/cryton-node';
import { CrytonStage } from '../cryton-node/cryton-stage';

export class NodeManager {
  /**
   * Triggers when a node is edited moved to editor.
   */
  editNode$ = new ReplaySubject<CrytonNode>(1);
  dispenserNodes$ = new BehaviorSubject<CrytonNode[]>([]);
  canvasNodes: CrytonNode[] = [];

  constructor() {}

  /**
   * Returns an array of all nodes which manager remembers.
   *
   * @returns Array of nodes.
   */
  getAllNodes(): CrytonNode[] {
    const allNodes = [...this.canvasNodes];
    allNodes.push(...this.dispenserNodes$.value);
    return allNodes;
  }

  /**
   * Moves a node from the canvas to the dispenser.
   *
   * @param node Node to move.
   */
  moveToDispenser(node: CrytonNode): void {
    this.removeCanvasNode(node);
    this.dispenserNodes$.next(this.dispenserNodes$.value.concat(node));
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
    this.editNode$.next(node);
  }

  /**
   * Removes node from the dispenser.
   *
   * @param node Node to remove.
   */
  removeDispenserNode(node: CrytonNode): void {
    const withoutNode = this.dispenserNodes$.value.filter(s => s !== node);
    this.dispenserNodes$.next(withoutNode);
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
   * @param ignoredName Doesn't check this name if provided.
   * @returns True if node name is unique.
   */
  isNodeNameUnique(name: string, ignoredName?: string): boolean {
    for (const node of this.getAllNodes()) {
      if (node.name === name && (!ignoredName || (ignoredName && ignoredName !== name))) {
        return false;
      }
    }
    return true;
  }
}
