export class ToolState {
  isVerticalMoveEnabled = false;
  isGraphMoveEnabled = false;

  constructor() {}

  flipVerticalMove(): void {
    this.isVerticalMoveEnabled = !this.isVerticalMoveEnabled;
  }

  flipGraphMove(): void {
    this.isGraphMoveEnabled = !this.isGraphMoveEnabled;
  }
}
