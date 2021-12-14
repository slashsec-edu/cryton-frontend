import { Injectable } from '@angular/core';
import { DependencyGraph } from '../classes/dependency-graph/dependency-graph';

@Injectable({
  providedIn: 'root'
})
export class ToolsService {
  constructor() {}

  enableSwap(depGraph: DependencyGraph): void {
    depGraph.toolState.flipSwapTool();
  }

  enableDelete(depGraph: DependencyGraph): void {
    depGraph.toolState.flipDeleteTool();
  }

  enableNodeMove(depGraph: DependencyGraph): void {
    depGraph.toolState.flipMoveNodeTool(depGraph.graphNodeManager.nodes);
  }

  rescale(depGraph: DependencyGraph, increment: number): void {
    depGraph.rescale(increment);
  }

  fitInsideScreen(depGraph: DependencyGraph): void {
    depGraph.fitScreen();
  }
}
