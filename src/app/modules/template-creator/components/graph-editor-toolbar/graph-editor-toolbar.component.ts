import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DependencyGraph } from '../../classes/dependency-graph/dependency-graph';
import { ToolsService } from '../../services/tools.service';

interface Tool {
  name: string;
  icon: string;
  action: () => void;
  active?: () => boolean;
}

@Component({
  selector: 'app-graph-editor-toolbar',
  templateUrl: './graph-editor-toolbar.component.html',
  styleUrls: ['./graph-editor-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphEditorToolbarComponent {
  @Input() depGraph: DependencyGraph;

  tools: Tool[] = [
    { name: 'Zoom in', icon: 'zoom_in', action: (): void => this._toolsService.rescale(this.depGraph, 0.1) },
    { name: 'Zoom out', icon: 'zoom_out', action: (): void => this._toolsService.rescale(this.depGraph, -0.1) },
    {
      name: 'Fit inside screen',
      icon: 'fullscreen',
      action: (): void => this._toolsService.fitInsideScreen(this.depGraph)
    },
    {
      name: 'Enable moving nodes',
      icon: 'back_hand',
      action: (): void => this._toolsService.enableNodeMove(this.depGraph),
      active: (): boolean => this.depGraph.toolState.isMoveNodeEnabled
    },
    {
      name: 'Enable swapping nodes',
      icon: 'swap_horizontal',
      action: (): void => this._toolsService.enableSwap(this.depGraph),
      active: (): boolean => this.depGraph.toolState.isSwapEnabled
    },
    {
      name: 'Enable deleting nodes',
      icon: 'delete_forever',
      action: (): void => this._toolsService.enableDelete(this.depGraph),
      active: (): boolean => this.depGraph.toolState.isDeleteEnabled
    }
  ];

  constructor(private _toolsService: ToolsService) {}
}
