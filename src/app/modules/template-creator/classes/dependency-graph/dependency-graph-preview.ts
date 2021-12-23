import Konva from 'konva';
import { Observable } from 'rxjs';
import { NodeType } from '../../models/enums/node-type';
import { Theme } from '../../models/interfaces/theme';
import { DependencyGraph } from './dependency-graph';

export class DependencyGraphPreview extends DependencyGraph {
  private _previewedGraph: DependencyGraph;

  constructor(nodeType: NodeType) {
    super(nodeType);
  }

  /**
   * Initializes dependency graph as a preview of previewedGraph inside a given container.
   *
   * @param previewedGraph Previewed dependency graph.
   * @param containerID ID of container.
   * @param container Container element.
   */
  initPreview(previewedGraph: DependencyGraph, container: HTMLDivElement, currentTheme$: Observable<Theme>): void {
    this._previewedGraph = previewedGraph;
    this.graphLayer = previewedGraph.graphLayer.clone() as Konva.Layer;
    super.initKonva(container, currentTheme$);

    this.stage.listening(false);
    this.stage.draggable(false);
  }

  /**
   * Refreshes dependency graph color theme.
   */
  protected _refreshTheme(): void {
    this._previewedGraph.updateTheme(this.theme);

    this.graphLayer = this._previewedGraph.graphLayer.clone() as Konva.Layer;
    this.stage.destroyChildren();
    this.stage.add(this.graphLayer);

    this.fitScreen();
    this.stage.draw();
  }
}
