export class ToolState {
  isVerticalMoveEnabled = false;
  isTreeMoveEnabled = false;

  constructor() {}

  flipVerticalMove(): void {
    this.isVerticalMoveEnabled = !this.isVerticalMoveEnabled;
  }

  flipTreeMove(): void {
    this.isTreeMoveEnabled = !this.isTreeMoveEnabled;
  }
}
