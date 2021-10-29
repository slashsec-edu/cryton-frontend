import Konva from 'konva';
import { LayerConfig } from 'konva/types/Layer';
import { Theme } from '../../template-creator/models/interfaces/theme';

export interface PaddingMaskConfig extends LayerConfig {
  timelinePadding: number[];
  timelineWidth: number;
  timelineHeight: number;
  invisibleSidePadding: boolean;
}

export class PaddingMask extends Konva.Layer {
  topMask: Konva.Rect;
  rightMask: Konva.Rect;
  bottomMask: Konva.Rect;
  leftMask: Konva.Rect;

  constructor(config?: PaddingMaskConfig) {
    super(config);
    this._createMask(config.timelinePadding, config.timelineWidth, config.timelineHeight);
  }

  addMiddleChild(child: Konva.Group | Konva.Shape): void {
    this.add(child);
    this.topMask.moveToTop();
    this.bottomMask.moveToTop();
  }

  destroyMiddleChildren(): void {
    const maxZIndex = this.children.length - 1;
    const middleChildren = this.getChildren(child => child.zIndex() !== 0 && child.zIndex() !== maxZIndex);

    middleChildren.toArray().forEach(child => child.destroy());
  }

  changeTheme(theme: Theme): void {
    const invisibleSidePadding = this.getAttr('invisibleSidePadding') as boolean;

    this.topMask.fill(theme.templateCreator.paddingMaskTop);
    this.bottomMask.fill(theme.templateCreator.background);

    if (!invisibleSidePadding) {
      this.rightMask.fill(theme.templateCreator.background);
      this.leftMask.fill(theme.templateCreator.background);
    }
  }

  updateDimensions(width: number, height: number): void {
    this.topMask.width(width);
    this.rightMask.height(height);
    this.bottomMask.width(width);
    this.leftMask.height(height);

    this.bottomMask.y(height - this.bottomMask.height());
    this.rightMask.x(width - this.rightMask.width());
  }

  private _createMask(padding: number[], width: number, height: number): void {
    this.topMask = this._createRect(width, padding[0]);
    this.rightMask = this._createRect(padding[1], height, width - padding[1]);
    this.bottomMask = this._createRect(width, padding[2], 0, height - padding[2]);
    this.leftMask = this._createRect(padding[3], height);

    this.add(this.topMask, this.rightMask, this.bottomMask, this.leftMask);

    this.topMask.moveToTop();
    this.bottomMask.moveToTop();
  }

  private _createRect(width: number, height: number, x = 0, y = 0): Konva.Rect {
    return new Konva.Rect({
      x,
      y,
      width,
      height,
      listening: false
    });
  }
}
