import { NodeType } from '../../models/enums/node-type';
import { CrytonNode } from '../cryton-node/cryton-node';
import { DependencyTree } from '../dependency-tree/dependency-tree';
import { TreeEdge } from '../dependency-tree/tree-edge';

export abstract class CrytonEdge {
  parentNode: CrytonNode;
  childNode: CrytonNode;

  depTree: DependencyTree;
  treeEdge: TreeEdge;

  abstract nodeType: NodeType;

  constructor(depTree: DependencyTree, parentNode: CrytonNode) {
    this.depTree = depTree;
    this.parentNode = parentNode;
    this.treeEdge = new TreeEdge(this);
  }

  /**
   * Connects edge to the child node.
   *
   * @param childNode Child node to connect to.
   */
  connect(childNode: CrytonNode): void {
    this.childNode = childNode;
    this.parentNode.addChildEdge(this);
    this.childNode.addParentEdge(this);
    try {
      this.isCorrectEdge();
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  /**
   * Destroys edge.
   */
  destroy(): void {
    this.parentNode.removeChildEdge(this);
    this.childNode?.removeParentEdge(this);
    this.treeEdge.konvaObject.destroy();
    this.treeEdge = null;
  }

  /**
   * Checks if edge from parent node to child node is a correct edge.
   * There must be no cycles.
   * There can't already be the same edge.
   */
  isCorrectEdge(): void {
    for (const childEdge of this.parentNode.childEdges) {
      if (childEdge !== this && childEdge.childNode === this.childNode) {
        throw new Error('Edge already exists.');
      }
    }
    if (this.doesCreateCycle()) {
      throw new Error('Edge creates a cycle.');
    }
  }

  /**
   * Checks if edge creates a cycle.
   *
   * @param startEdge Edge where call stack started, should be left empty.
   * @returns True if edge creates a cycle.
   */
  doesCreateCycle(startEdge: CrytonEdge = this): boolean {
    return this.childNode.childEdges.some(childEdge => childEdge === startEdge || childEdge.doesCreateCycle(startEdge));
  }
}
