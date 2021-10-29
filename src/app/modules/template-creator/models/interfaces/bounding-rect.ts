/**
 * Bounding rectangle defined by upper leftmost point (min) and
 * bottom rightmost point (max).
 */
export interface BoundingRect {
  min: {
    x: number;
    y: number;
  };
  max: {
    x: number;
    y: number;
  };
}
