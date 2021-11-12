import { DebugElement } from '@angular/core';
import Konva from 'konva';
import { Observable, Subscription } from 'rxjs';
import { Theme } from '../../models/interfaces/theme';
import { CursorState } from '../dependency-tree/cursor-state';

export abstract class KonvaWrapper {
  cursorState = new CursorState();
  stage: Konva.Stage;
  theme: Theme;

  protected _container: HTMLDivElement;
  protected _stageX = 0;
  protected _stageY = 0;
  protected _scale = 1;

  private _themeSub: Subscription;

  constructor() {}

  get width(): number {
    return this.stage.width();
  }
  get height(): number {
    return this.stage.height();
  }

  get stageX(): number {
    return this.stage ? this.stage.x() : this._stageX;
  }
  set stageX(value: number) {
    if (this.stage) {
      this.stage.x(value);
    } else {
      this._stageX = value;
    }
  }

  get stageY(): number {
    return this.stage ? this.stage.y() : this._stageY;
  }
  set stageY(value: number) {
    if (this.stage) {
      this.stage.y(value);
    } else {
      this._stageY = value;
    }
  }

  get scale(): number {
    return this.stage ? this.stage.scaleX() : this._scale;
  }
  set scale(value: number) {
    if (this.stage) {
      this.stage.scaleX(value);
      this.stage.scaleY(value);
    } else {
      this._scale = value;
    }
  }

  destroy(): void {
    this._themeSub?.unsubscribe();
  }

  /**
   * Updates dimensions of stage based on dimensions of bounding rectangle of its container element.
   */
  updateDimensions(): void {
    const boundingRect = this._getBoundingRect(this._container);

    if (boundingRect && this.stage) {
      this.stage.width(boundingRect.width);
      this.stage.height(boundingRect.height);
    }
  }

  /**
   * Removes all children of stage.
   */
  removeChildren(): void {
    this.stage.removeChildren();
  }

  /**
   * Initializes konva inside a given container.
   *
   * @param container Container element.
   * @param currentTheme$ Observable which emits Theme object every time theme changes.
   */
  initKonva(container: HTMLDivElement, currentTheme$: Observable<Theme>): void {
    this._container = container;
    this.cursorState.container = container as HTMLElement;

    if (this.stage) {
      this.stage.container(container);
    } else {
      this._createStage(container);
    }

    this.stage.draw();
    this._createThemeSub(currentTheme$);
  }

  /**
   * Returns all nodes with a given name inside a given layer.
   *
   * @param name Node name.
   * @param layer Layer to search through.
   * @returns Array of nodes.
   */
  findNodesByName(name: string, layer: Konva.Layer): Konva.Node[] {
    return Array.from(layer.find(`.${name}`));
  }

  /**
   * Returns the bounding rectangle of the container element.
   *
   * @param container Canvas container.
   * @returns DOMRect
   */
  protected _getBoundingRect(container: DebugElement | HTMLDivElement): DOMRect {
    if (!container) {
      return null;
    }
    if (container instanceof DebugElement) {
      const nativeElement: HTMLElement = container.nativeElement as HTMLElement;
      return nativeElement.getBoundingClientRect();
    } else {
      return container.getBoundingClientRect();
    }
  }

  private _createThemeSub(theme$: Observable<Theme>): void {
    if (!this._themeSub) {
      theme$.subscribe(theme => {
        this.theme = theme;
        this._refreshTheme();
      });
    }
  }

  protected abstract _createStage(container: HTMLDivElement): void;
  protected abstract _refreshTheme(): void;
}
