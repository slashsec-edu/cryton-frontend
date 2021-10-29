import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { DependencyTree } from '../../classes/dependency-tree/dependency-tree';
import { ToolsService } from '../../services/tools.service';

interface Tool {
  name: string;
  icon: string;
  action: () => void;
  active?: () => boolean;
}

@Component({
  selector: 'app-tree-editor-toolbar',
  templateUrl: './tree-editor-toolbar.component.html',
  styleUrls: ['./tree-editor-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TreeEditorToolbarComponent implements OnInit {
  @Input() depTree: DependencyTree;

  tools: Tool[] = [
    { name: 'Zoom in', icon: 'zoom_in', action: (): void => this._toolsService.rescale(this.depTree, 0.1) },
    { name: 'Zoom out', icon: 'zoom_out', action: (): void => this._toolsService.rescale(this.depTree, -0.1) },
    {
      name: 'Fit inside screen',
      icon: 'fullscreen',
      action: (): void => this._toolsService.fitInsideScreen(this.depTree)
    },
    {
      name: 'Enable moving nodes',
      icon: 'back_hand',
      action: (): void => this._toolsService.enableNodeMove(this.depTree),
      active: (): boolean => this.depTree.toolState.isMoveNodeEnabled
    },
    {
      name: 'Enable swapping nodes',
      icon: 'swap_horizontal',
      action: (): void => this._toolsService.enableSwap(this.depTree),
      active: (): boolean => this.depTree.toolState.isSwapEnabled
    },
    {
      name: 'Enable deleting nodes',
      icon: 'delete_forever',
      action: (): void => this._toolsService.enableDelete(this.depTree),
      active: (): boolean => this.depTree.toolState.isDeleteEnabled
    }
  ];

  constructor(private _toolsService: ToolsService) {}

  ngOnInit(): void {}
}
