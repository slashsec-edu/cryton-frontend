import Konva from 'konva';
import { Vector2d } from 'konva/types/types';

export const simulateStageDrag = (stage: Konva.Stage, xDist: number, yDist: number): void => {
  simulateMouseDown(stage, { x: stage.width() / 2, y: stage.height() / 2 });
  simulateMouseMove(stage, { x: stage.width() / 2 + xDist, y: stage.height() / 2 + yDist });
  simulateMouseUp(stage, { x: stage.width() / 2 + xDist, y: stage.height() / 2 + yDist });
};

export const simulateMouseDown = (stage: Konva.Stage, pos: Vector2d): void => {
  simulatePointerDown(stage, pos);
  const top = stage.content.getBoundingClientRect().top;

  stage._pointerdown({
    clientX: pos.x,
    clientY: pos.y + top,
    type: 'mousedown'
  } as PointerEvent);
};

export const simulateMouseMove = (stage: Konva.Stage, pos: Vector2d): void => {
  simulatePointerMove(stage, pos);
  const top = stage.content.getBoundingClientRect().top;

  const evt = {
    clientX: pos.x,
    clientY: pos.y + top,
    button: 0,
    type: 'mousemove'
  };

  stage._pointermove(evt as PointerEvent);
  Konva.DD._drag(evt);
};

export const simulateMouseUp = (stage: Konva.Stage, pos: Vector2d): void => {
  simulatePointerUp(stage, pos);

  const top = stage.content.getBoundingClientRect().top;

  const evt = {
    clientX: pos.x,
    clientY: pos.y + top,
    button: 0,
    type: 'mouseup'
  };

  Konva.DD._endDragBefore(evt);
  stage._pointerup(evt as PointerEvent);
  Konva.DD._endDragAfter(evt);
};

export const simulatePointerDown = (stage: Konva.Stage, pos: Vector2d): void => {
  const top = stage.content.getBoundingClientRect().top;

  stage._pointerdown({
    clientX: pos.x,
    clientY: pos.y + top,
    button: 0,
    pointerId: 1,
    type: 'pointerdown'
  } as PointerEvent);
};

export const simulatePointerMove = (stage: Konva.Stage, pos: Vector2d): void => {
  const top = stage.content.getBoundingClientRect().top;

  stage._pointermove({
    clientX: pos.x,
    clientY: pos.y + top,
    button: 0,
    pointerId: 1,
    type: 'pointermove'
  } as PointerEvent);
};

export const simulatePointerUp = (stage: Konva.Stage, pos: Vector2d): void => {
  const top = stage.content.getBoundingClientRect().top;

  stage._pointerup({
    clientX: pos.x,
    clientY: pos.y + top,
    button: 0,
    pointerId: 1,
    type: 'pointerup'
  } as PointerEvent);
};
