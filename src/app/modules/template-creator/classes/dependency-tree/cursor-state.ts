export enum Cursor {
  POINTER = 'pointer',
  GRAB = 'grab'
}

export class CursorState {
  private _container: HTMLElement;

  private _cursorState = {
    pointer: 0,
    grab: 0
  };

  constructor() {}

  set container(container: HTMLElement) {
    this._container = container;
  }

  /**
   * Increments cursor value by one.
   *
   * @param cursorType Type of the cursor to increment.
   */
  setCursor = (cursorType: Cursor): void => {
    this._cursorState[cursorType]++;
    this._updateCursor();
  };

  /**
   * Decrements cursor value by one if > 0.
   *
   * @param cursorType Type of the cursor to decrement.
   */
  unsetCursor(cursorType: Cursor): void {
    if (this._cursorState[cursorType] > 0) {
      this._cursorState[cursorType]--;
      this._updateCursor();
    }
  }

  /**
   * Resets cursor values to zero.
   */
  resetCursor = (): void => {
    this._cursorState = {
      pointer: 0,
      grab: 0
    };
    this._updateCursor();
  };

  /**
   * Updates cursor css in container based on cursor values.
   */
  private _updateCursor(): void {
    if (this._cursorState[Cursor.POINTER] > 0) {
      this._container.style.cursor = 'pointer';
    } else if (this._cursorState[Cursor.GRAB] > 0) {
      this._container.style.cursor = 'grab';
    } else {
      this._container.style.cursor = 'default';
    }
  }
}
