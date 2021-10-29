import { CrytonEdge } from '../cryton-edge/cryton-edge';
import { DependencyTree } from '../dependency-tree/dependency-tree';
import { TreeNode } from '../dependency-tree/tree-node';

export abstract class CrytonNode {
  name: string;
  childEdges: CrytonEdge[] = [];
  parentEdges: CrytonEdge[] = [];

  parentDepTree: DependencyTree;
  treeNode: TreeNode;

  constructor(name: string, parentDepTree: DependencyTree) {
    this.name = name;
    this.parentDepTree = parentDepTree;
  }

  /**
   * Adds a child edge to the node.
   *
   * @param edge Child edge to add.
   */
  addChildEdge(edge: CrytonEdge): void {
    this.childEdges.push(edge);
  }

  /**
   * Adds a parent edge to the node.
   *
   * @param edge Parent edge to add.
   */
  addParentEdge(edge: CrytonEdge): void {
    this.parentEdges.push(edge);
  }

  /**
   * Removes child edge from the node.
   *
   * @param edge Child edge to remove.
   */
  removeChildEdge(edge: CrytonEdge): void {
    this._removeEdge(this.childEdges, edge);
  }

  /**
   * Removes parent edge from the node.
   *
   * @param edge Parent edge to remove.
   */
  removeParentEdge(edge: CrytonEdge): void {
    this._removeEdge(this.parentEdges, edge);
  }

  /**
   * Destroys all edges.
   */
  destroyEdges(): void {
    [...this.parentEdges].forEach(edge => edge.destroy());
    [...this.childEdges].forEach(edge => edge.destroy());
  }

  /**
   * Destroys node.
   */
  destroy(): void {
    this.destroyEdges();
    this.treeNode.konvaObject.destroy();
    this.treeNode = null;
  }

  /**
   * Unattaches node from the dependency tree.
   * Node can still be reattached.
   */
  unattach(): void {
    this.destroyEdges();
    this.treeNode.konvaObject.remove();
  }

  /**
   * Edits node name and updated tree node.
   *
   * @param name New node name.
   */
  editName(name: string): void {
    this.name = name;
    this.treeNode.changeName(name);
  }

  /**
   * Removes edge from the edge array.
   *
   * @param edgeArray Array of edges to remove from.
   * @param edge Edge to remove.
   */
  private _removeEdge(edgeArray: CrytonEdge[], edge: CrytonEdge): void {
    const edgeIndex = edgeArray.indexOf(edge);

    if (edgeIndex !== -1) {
      edgeArray.splice(edgeIndex, 1);
    }
  }
}
