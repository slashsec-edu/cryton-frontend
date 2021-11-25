import { TreeNode } from './node/tree-node';

export class ToolState {
  isSwapEnabled = false;
  isDeleteEnabled = false;
  isMoveNodeEnabled = false;

  constructor() {}

  flipSwapTool(): boolean {
    this.isSwapEnabled = this._toolClick(this.isSwapEnabled);
    return this.isSwapEnabled;
  }

  flipDeleteTool(): boolean {
    this.isDeleteEnabled = this._toolClick(this.isDeleteEnabled);
    return this.isDeleteEnabled;
  }

  flipMoveNodeTool(nodes: TreeNode[]): boolean {
    this.isMoveNodeEnabled = this._toolClick(this.isMoveNodeEnabled);

    nodes.forEach(node => node.konvaObject.draggable(this.isMoveNodeEnabled));

    return this.isMoveNodeEnabled;
  }

  /**
   * Disables all tools and returns inverse value of isToolEnabled.
   *
   * @param isToolEnabled Value of is<ToolName>Enabled of clicked tool.
   */
  private _toolClick(isToolEnabled: boolean): boolean {
    // Swap tool
    this.isSwapEnabled = false;

    // Delete tool
    this.isDeleteEnabled = false;

    // Move node tool
    this.isMoveNodeEnabled = false;

    return !isToolEnabled;
  }
}
