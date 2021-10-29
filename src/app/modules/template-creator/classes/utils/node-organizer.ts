import { Queue } from 'src/app/modules/shared/utils/queue';
import { TreeEdge } from '../dependency-tree/tree-edge';
import { NODE_HEIGHT, NODE_WIDTH, TreeNode } from '../dependency-tree/tree-node';
import { TimelineEdge } from '../timeline/timeline-edge';
import { TimelineNode } from '../timeline/timeline-node';
import { NODE_RADIUS } from '../timeline/timeline-node-constants';

export enum NodeType {
  STEP,
  STAGE,
  TIMELINE
}

type Node = TimelineNode | TreeNode;
type Edge = TimelineEdge | TreeEdge;
type Bounds = { top: number; bottom: number; left: number; right: number };
export const NODE_PADDING = 40;
export const NODE_MARGIN = 0.25;

export class NodeOrganizer {
  private _nodeType: NodeType;

  constructor(nodeType: NodeType) {
    this._nodeType = nodeType;
  }

  /**
   * Moves the entire tree starting from the root node by a given
   * increment on x and y axes.
   *
   * @param rootNode Root node of the tree.
   * @param xIncrement X increment.
   * @param yIncrement Y increment.
   * @param moveRoot Specifies if root node should be moved as well.
   * @param edgePredicate Predicate function for filtering nodes to be visited.
   */
  static moveTree(
    rootNode: Node,
    xIncrement: number,
    yIncrement: number,
    moveRoot = false,
    edgePredicate?: (edge: Edge) => boolean
  ): void {
    NodeOrganizer._moveTreeHelper(rootNode, xIncrement, yIncrement, moveRoot ? null : rootNode, edgePredicate);
  }

  /**
   * Helper method for the moveTree method. Does the actual moving of the tree.
   *
   * @param rootNode Root node of the tree.
   * @param xIncrement X increment.
   * @param yIncrement Y increment.
   * @param dontMoveNode A node that shouldn't be moved (used for root node of the entire tree).
   * @param edgePredicate Predicate function for filtering nodes to be visited.
   * @param visited Set of visited nodes for cycle detection.
   */
  private static _moveTreeHelper(
    rootNode: Node,
    xIncrement: number,
    yIncrement: number,
    dontMoveNode: Node,
    edgePredicate?: (edge: Edge) => boolean,
    visited = new Set<Node>()
  ) {
    visited.add(rootNode);

    if (rootNode !== dontMoveNode) {
      rootNode.x += xIncrement;
      rootNode.y += yIncrement;
    }

    let nextEdges: Edge[] = rootNode.childEdges;

    if (edgePredicate) {
      nextEdges = nextEdges.filter(edge => edgePredicate(edge));
    }

    for (const edge of nextEdges) {
      const currentNode = edge.childNode;

      if (!visited.has(currentNode)) {
        NodeOrganizer._moveTreeHelper(currentNode, xIncrement, yIncrement, dontMoveNode, edgePredicate, visited);
      }
    }
  }

  /**
   * Organizes a tree defined by the root node.
   *
   * @param rootNode Root node of the tree.
   */
  organizeTree(rootNode: Node): void {
    this._organizeTree(rootNode, -Infinity, Infinity);
  }

  /**
   * Organizes individual trees in the plan.
   *
   * Algorithm builds the first tree, calculates leftover nodes and builds next trees from them.
   * For each tree it checks if it intersects with any other tree and moves it accordingly to the big enough
   * space closest to the center of the canvas.
   *
   * @param nodes Array of nodes to be organized.
   * @returns Bounds of the entire plan.
   */
  organizeNodes(nodes: Node[]): Bounds {
    if (nodes.length < 2) {
      return;
    }

    nodes.forEach(node => {
      if (this._nodeType === NodeType.TIMELINE) {
        node.y = 0;
      } else {
        node.x = 0;
      }
    });

    const rootNodes = nodes.filter(node => node.parentEdges.length === 0);
    const prevBounds = [];

    while (rootNodes.length > 0) {
      const currentNode = rootNodes.pop();
      const currentBounds = this._organizeTree(currentNode, -Infinity, Infinity);

      if (this._nodeType !== NodeType.TIMELINE) {
        currentBounds.left -= NODE_MARGIN * NODE_WIDTH;
        currentBounds.right += NODE_MARGIN * NODE_WIDTH;
      }

      const intersecting = prevBounds.filter(bounds =>
        this._nodeType === NodeType.TIMELINE
          ? this._doesXOverlap(bounds, currentBounds)
          : this._doesYOverlap(bounds, currentBounds)
      );

      if (intersecting.length === 0) {
        prevBounds.push(currentBounds);
        continue;
      }

      const spaces: Bounds[] = this._findSpaces(
        intersecting,
        this._nodeType === NodeType.TIMELINE
          ? currentBounds.bottom - currentBounds.top + 2 * NODE_PADDING
          : currentBounds.right - currentBounds.left + 2 * NODE_PADDING
      );

      const closestToCenter = this._findClosestToCenter(spaces, 0);

      let increment: number;
      const closestLowerCoord = this._nodeType === NodeType.TIMELINE ? closestToCenter.top : closestToCenter.left;
      const closestHigherCoord = this._nodeType === NodeType.TIMELINE ? closestToCenter.bottom : closestToCenter.right;
      const currLowerCoord = this._nodeType === NodeType.TIMELINE ? currentBounds.top : currentBounds.left;
      const currHigherCoord = this._nodeType === NodeType.TIMELINE ? currentBounds.bottom : currentBounds.right;

      if (closestHigherCoord !== Infinity) {
        increment = -Math.abs(currHigherCoord - closestHigherCoord) - NODE_PADDING;
      } else if (closestLowerCoord !== -Infinity) {
        increment = Math.abs(currLowerCoord - closestLowerCoord) + NODE_PADDING;
      } else {
        increment =
          closestLowerCoord +
          (closestHigherCoord - closestLowerCoord) / 2 -
          (currLowerCoord + (currHigherCoord - currLowerCoord) / 2);
      }

      if (this._nodeType === NodeType.TIMELINE) {
        NodeOrganizer.moveTree(currentNode, 0, increment, true);
        currentBounds.top += increment;
        currentBounds.bottom += increment;
      } else {
        NodeOrganizer.moveTree(currentNode, increment, 0, true);
        currentBounds.left += increment;
        currentBounds.right += increment;
      }
      prevBounds.push(currentBounds);
    }
  }

  /**
   * Finds an empty space which is closest to the X (Stages) / Y (Timeline nodes)
   * coordinate of center of the canvas.
   *
   * @param spaces Array of empty spaces.
   * @param centerCoord X/Y coordinate of center of the canvas.
   * @returns Space closest to the center.
   */
  private _findClosestToCenter(spaces: Bounds[], centerCoord: number): Bounds {
    let closestToCenter: Bounds;
    let distFromMiddle: number;

    spaces.forEach(space => {
      let currentDist = 0;
      if (space.top === -Infinity) {
        currentDist = Math.abs(space.bottom - NODE_PADDING - centerCoord);
      } else if (space.bottom === Infinity) {
        currentDist = Math.abs(space.top + NODE_PADDING - centerCoord);
      } else {
        currentDist = Math.abs((space.bottom - space.top) / 2 - centerCoord);
      }

      if (!distFromMiddle || currentDist < distFromMiddle) {
        distFromMiddle = currentDist;
        closestToCenter = space;
      }
    });

    return closestToCenter;
  }

  /**
   * Finds all vertical (Timeline nodes) / horizontal (Stages) spaces between bounds of trees which intersect with
   * a given tree on X/Y axis. Also appends the space from bounds with the lowest X/Y to -Infinity
   * and the space from bounds with the highest X/Y to Infinity.
   *
   * @param intersecting Bounds of trees which intersect with a given tree on X/Y axis.
   * @param minSize Minimal size of space to be included in the output array.
   * @returns Array of satisfactory spaces between bounds.
   */
  private _findSpaces(intersecting: Bounds[], minSize: number): Bounds[] {
    intersecting.sort((a: Bounds, b: Bounds) =>
      this._nodeType === NodeType.TIMELINE ? a.top - b.top : a.left - b.left
    );
    const spaces: Bounds[] = [];

    for (let i = 1; i < intersecting.length; i++) {
      const spaceSize =
        this._nodeType === NodeType.TIMELINE
          ? intersecting[i].top - intersecting[i - 1].bottom
          : intersecting[i].left - intersecting[i - 1].right;

      if (spaceSize > minSize) {
        if (this._nodeType === NodeType.TIMELINE) {
          spaces.push({
            top: intersecting[i - 1].bottom,
            right: Infinity,
            bottom: intersecting[i].top,
            left: -Infinity
          });
        } else {
          spaces.push({
            top: Infinity,
            right: intersecting[i - 1].right,
            bottom: -Infinity,
            left: intersecting[i].left
          });
        }
      }
    }

    if (intersecting.length > 0) {
      if (this._nodeType === NodeType.TIMELINE) {
        spaces.push({ top: -Infinity, right: Infinity, bottom: intersecting[0].top, left: -Infinity });
        spaces.push({
          top: intersecting[intersecting.length - 1].bottom,
          right: Infinity,
          bottom: Infinity,
          left: -Infinity
        });
      } else {
        spaces.push({ top: -Infinity, right: intersecting[0].left, bottom: Infinity, left: -Infinity });
        spaces.push({
          top: -Infinity,
          right: intersecting[intersecting.length - 1].right,
          bottom: Infinity,
          left: -Infinity
        });
      }
    }

    return spaces;
  }

  /**
   * Organizes a tree which starts at the given root node.
   *
   * @param rootNode Root node of the tree.
   * @param minCoord Minimum coordinate where txree bounds can reach.
   * @param maxCoord Maximum coordinate where tree bounds can reach.
   * @returns Bounds of organized tree.
   */
  private _organizeTree(rootNode: Node, minCoord: number, maxCoord: number): Bounds {
    this._setRootNodeCoord(rootNode, minCoord, maxCoord);

    // Only last parent should calc Y position for better structure
    // Sort edges by child node name for deterministic result
    const childEdges = this._filterSortEdges(rootNode);

    if (this._nodeType !== NodeType.TIMELINE && rootNode.parentEdges.length > 0) {
      rootNode.y = rootNode.parentEdges[0].parentNode.y + NODE_HEIGHT + 2 * NODE_PADDING;
    }

    let centerTreeBounds = this._calcNodeBounds(rootNode);

    const myBounds = Object.assign({}, centerTreeBounds);
    let startIndex = 0;

    if (childEdges.length % 2 === 1) {
      startIndex = 1;

      if (this._nodeType === NodeType.TIMELINE) {
        childEdges[0].childNode.y = rootNode.y;
      } else {
        childEdges[0].childNode.x = rootNode.x;
      }
      centerTreeBounds = this._organizeTree(childEdges[0].childNode, -Infinity, Infinity);

      // Add padding if there are gonna be more children around the middle node.
      if (childEdges.length > 1) {
        if (this._nodeType === NodeType.TIMELINE) {
          centerTreeBounds.top -= NODE_PADDING;
          centerTreeBounds.bottom += NODE_PADDING;
        } else {
          centerTreeBounds.left -= NODE_PADDING;
          centerTreeBounds.right += NODE_PADDING;
        }
      }

      this._updateBounds(myBounds, centerTreeBounds);
    }

    if (childEdges.length > 1) {
      const centerIndex = Math.floor((childEdges.length - startIndex) / 2) + startIndex;

      let lastBounds = Object.assign({}, centerTreeBounds);

      for (let i = startIndex; i < centerIndex; i++) {
        lastBounds = this._organizeTree(
          childEdges[i].childNode,
          -Infinity,
          this._nodeType === NodeType.TIMELINE ? lastBounds.top : lastBounds.left
        );
        this._updateBounds(myBounds, lastBounds);
      }

      lastBounds = Object.assign({}, centerTreeBounds);

      for (let i = centerIndex; i < childEdges.length; i++) {
        lastBounds = this._organizeTree(
          childEdges[i].childNode,
          this._nodeType === NodeType.TIMELINE ? lastBounds.bottom : lastBounds.right,
          Infinity
        );
        this._updateBounds(myBounds, lastBounds);
      }
    }

    this._checkBounds(rootNode, myBounds, minCoord, maxCoord);

    return myBounds;
  }

  /**
   * Calculates bounds of a given node.
   *
   * @param node Node to calculate bounds of.
   * @returns Bounds of a given node.
   */
  private _calcNodeBounds(node: Node): Bounds {
    const nodeHeight = this._nodeType === NodeType.TIMELINE ? NODE_RADIUS : NODE_HEIGHT;
    const nodeWidth = this._nodeType === NodeType.TIMELINE ? NODE_RADIUS : NODE_WIDTH;

    return {
      top: node.y - (this._nodeType === NodeType.TIMELINE ? nodeHeight : 0),
      bottom: node.y + nodeHeight,
      left: node.x + (this._nodeType === NodeType.TIMELINE ? -nodeWidth : nodeWidth * NODE_MARGIN),
      right: node.x + nodeWidth * (1 - NODE_MARGIN)
    };
  }

  /**
   * Compares all coordinates of bounds and updates the values
   * to the min/max coordinate.
   *
   * @param bounds Bounds to be updates.
   * @param newBounds Bounds to compare with.
   */
  private _updateBounds(bounds: Bounds, newBounds: Bounds): void {
    bounds.top = Math.min(bounds.top, newBounds.top);
    bounds.bottom = Math.max(bounds.bottom, newBounds.bottom);
    bounds.right = Math.max(bounds.right, newBounds.right);
    bounds.left = Math.min(bounds.left, newBounds.left);
  }

  /**
   * Sets the root node coordinate based on minimal and maximal coordinate.
   *
   * @param rootNode Root node of a tree.
   * @param maxCoord Maximal coordinate.
   * @param minCoord Minimal coordinate.
   */
  private _setRootNodeCoord(rootNode: Node, minCoord: number, maxCoord: number) {
    if (maxCoord !== Infinity) {
      if (this._nodeType === NodeType.TIMELINE) {
        rootNode.y = maxCoord - NODE_RADIUS;
      } else {
        rootNode.x = maxCoord - NODE_WIDTH;
      }
    } else if (minCoord !== -Infinity) {
      if (this._nodeType === NodeType.TIMELINE) {
        rootNode.y = minCoord + NODE_RADIUS;
      } else {
        rootNode.x = minCoord;
      }
    }
  }

  /**
   * Filters out all edges to nodes of which the root node isn't the last parent.
   * Sorts the remaining nodes lexicographically by name.
   *
   * @param node Node whoose edges are processed.
   * @returns Array of processed nodes.
   */
  private _filterSortEdges(node: Node): Edge[] {
    const edges = node.childEdges as Edge[];

    return edges
      .filter(edge => this._isNodeLastParent(node as TimelineNode, edge.childNode as TimelineNode))
      .sort((a: Edge, b: Edge) => {
        const aName = a.childNode.crytonNode.name;
        const bName = b.childNode.crytonNode.name;

        return aName === bName ? 0 : aName < bName ? -1 : 1;
      });
  }

  /**
   * Sorting function for timeline nodes.
   * Sorts nodes primarily by delta and secondarily by name.
   *
   * @param a Node A.
   * @param b Node B.
   * @returns Sorting order.
   */
  private _timelineNodeSort(a: TimelineNode, b: TimelineNode): number {
    const aStart = a.crytonNode.trigger.getStartTime() ?? 0;
    const bStart = b.crytonNode.trigger.getStartTime() ?? 0;

    const diff = aStart - bStart;
    if (diff === 0) {
      return this._nameSort(a, b);
    }
    return diff;
  }

  /**
   * Sorting function for sorting nodes by name.
   *
   * @param a Node A.
   * @param b Node B.
   * @returns Sorting order.
   */
  private _nameSort(a: Node, b: Node): number {
    if (a.crytonNode.name === b.crytonNode.name) {
      return 0;
    }
    return a.crytonNode.name < b.crytonNode.name ? -1 : 1;
  }

  /**
   * Decides if bounds overlap on X axes.
   *
   * @param bounds1 Bounds 1.
   * @param bounds2 Bounds 2.
   * @returns True if bounds overlap.
   */
  private _doesXOverlap(bounds1: Bounds, bounds2: Bounds): boolean {
    return !(bounds1.left >= bounds2.right || bounds2.left >= bounds1.right);
  }

  /**
   * Decides if bounds overlap on Y axes.
   *
   * @param bounds1 Bounds 1.
   * @param bounds2 Bounds 2.
   * @returns True if bounds overlap.
   */
  private _doesYOverlap(bounds1: Bounds, bounds2: Bounds): boolean {
    return !(bounds1.bottom <= bounds2.top || bounds2.bottom <= bounds2.top);
  }

  /**
   * Decides if a node is the last parent of a child node.
   *
   * Timeline nodes: parent with the greates delta is the last parent.
   * Stages: parent with the longest distance from the root node is the last parent.
   *
   * @param parentNode Parent node.
   * @param childNode Child node.
   * @returns True if node is the last parent.
   */
  private _isNodeLastParent(parentNode: Node, childNode: Node): boolean {
    const parents = (childNode.parentEdges as Edge[]).map(edge => edge.parentNode);

    if (this._nodeType === NodeType.TIMELINE) {
      const parentStart = (parentNode as TimelineNode).crytonNode.trigger.getStartTime() ?? 0;

      return !parents.some((otherNode: TimelineNode) => {
        const otherStart = otherNode.crytonNode.trigger.getStartTime() ?? 0;
        return (
          otherStart > parentStart ||
          (otherStart === parentStart && otherNode.crytonNode.name < parentNode.crytonNode.name)
        );
      });
    } else {
      return !parents.some(parent =>
        parent === parentNode ? false : this._nodeDistFromRoot(parent) > this._nodeDistFromRoot(parentNode)
      );
    }
  }

  /**
   * Calculates node's distance from the root node.
   *
   * @param node Node to calculate the distance of.
   * @returns Distance from the root.
   */
  private _nodeDistFromRoot(node: Node): number {
    const queue = new Queue<Node>();
    const distances: Record<string, number> = {};
    distances[node.crytonNode.name] = 0;
    queue.enqueue(node);

    while (!queue.isEmpty()) {
      const currentNode = queue.dequeue();

      if (currentNode.parentEdges.length === 0) {
        return distances[currentNode.crytonNode.name];
      }

      currentNode.parentEdges.forEach((parentEdge: Edge) => {
        const parent = parentEdge.parentNode;
        if (!distances[parent.crytonNode.name]) {
          distances[parent.crytonNode.name] = distances[currentNode.crytonNode.name] + 1;
          queue.enqueue(parent);
        }
      });
    }
  }

  /**
   * Checks if the bounds exceed the max/min coordinates and if they do,
   * moves the tree starting at the root node accordingly.
   *
   * @param rootNode Root node of a tree with the given bounds.
   * @param treeBounds Bounds of a tree with a given root node.
   * @param minCoord Maximal coordinate of the tree bounds.
   * @param maxCoord Minimal coordinate of the tree bounds.
   */
  private _checkBounds(rootNode: Node, treeBounds: Bounds, minCoord: number, maxCoord: number): void {
    let increment = 0;

    if (this._nodeType === NodeType.TIMELINE) {
      if (treeBounds.bottom > maxCoord) {
        increment = -(treeBounds.bottom - maxCoord);
      } else if (treeBounds.top < minCoord) {
        increment = minCoord - treeBounds.top;
      }
    } else {
      const nodeRight = treeBounds.right + NODE_MARGIN * NODE_WIDTH;
      const nodeLeft = treeBounds.left - NODE_MARGIN * NODE_WIDTH;
      if (nodeRight > maxCoord) {
        increment = -(nodeRight - maxCoord);
      } else if (nodeLeft < minCoord) {
        increment = minCoord - nodeLeft;
      }
    }

    if (increment !== 0) {
      if (this._nodeType === NodeType.TIMELINE) {
        NodeOrganizer.moveTree(rootNode, 0, increment, true);
        treeBounds.top += increment;
        treeBounds.bottom += increment;
      } else {
        NodeOrganizer.moveTree(rootNode, increment, 0, true);
        treeBounds.left += increment;
        treeBounds.right += increment;
      }
    }
  }
}
