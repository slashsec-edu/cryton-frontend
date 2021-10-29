import { DebugElement } from '@angular/core';
import Konva from 'konva';
import { Observable } from 'rxjs';
import { NodeType } from '../../models/enums/node-type';
import { Theme } from '../../models/interfaces/theme';
import { DependencyTree } from './dependency-tree';

export class PreviewDependencyTree extends DependencyTree {
  private _previewedTree: DependencyTree;

  constructor(nodeType: NodeType) {
    super(nodeType);
  }

  /**
   * Initializes dependency tree as a preview of previewedTree inside a given container.
   *
   * @param previewedTree Previewed dependency tree.
   * @param containerID ID of container.
   * @param container Container element.
   */
  initPreview(
    previewedTree: DependencyTree,
    containerID: string,
    container: DebugElement,
    currentTheme$: Observable<Theme>
  ): void {
    this._previewedTree = previewedTree;
    this.treeLayer = previewedTree.treeLayer.clone() as Konva.Layer;
    super.initKonva(containerID, container, currentTheme$);

    this.stage.listening(false);
    this.stage.draggable(false);
  }

  /**
   * Refreshes dependency tree color theme.
   */
  protected _refreshTheme(): void {
    this._previewedTree.updateTheme(this.theme);

    this.treeLayer = this._previewedTree.treeLayer.clone() as Konva.Layer;
    this.stage.destroyChildren();
    this.stage.add(this.treeLayer);

    this.fitScreen();
    this.stage.draw();
  }
}
