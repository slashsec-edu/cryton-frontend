import { Injectable } from '@angular/core';
import { DependencyTree } from '../classes/dependency-tree/dependency-tree';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  constructor() {}

  enableSwap(depTree: DependencyTree): void {
    depTree.toolState.flipSwapTool();
  }

  enableDelete(depTree: DependencyTree): void {
    depTree.toolState.flipDeleteTool();
  }

  enableNodeMove(depTree: DependencyTree): void {
    depTree.toolState.flipMoveNodeTool(depTree.treeNodeManager.canvasNodes, depTree.cursorState);
  }

  rescale(depTree: DependencyTree, increment: number): void {
    depTree.rescale(increment);
  }

  fitInsideScreen(depTree: DependencyTree): void {
    depTree.fitScreen();
  }
}
