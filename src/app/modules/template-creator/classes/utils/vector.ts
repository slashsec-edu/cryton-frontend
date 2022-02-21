export class Vector {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(vector: Vector): Vector {
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  subtract(vector: Vector): Vector {
    return new Vector(this.x - vector.x, this.y - vector.y);
  }

  multiply(vector: Vector): Vector {
    return new Vector(this.x * vector.x, this.y * vector.y);
  }

  multiplyScalar(scalar: number): Vector {
    return new Vector(this.x * scalar, this.y * scalar);
  }

  divide(vector: Vector): Vector {
    return new Vector(this.x / vector.x, this.y / vector.y);
  }

  divideScalar(scalar: number): Vector {
    return new Vector(this.x / scalar, this.y / scalar);
  }

  length(): number {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
  }

  normalize(): Vector {
    return this.divideScalar(this.length());
  }
}
