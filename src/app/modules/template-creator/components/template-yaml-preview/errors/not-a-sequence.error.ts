export class NotASequenceError extends Error {
  constructor(propertName: string) {
    super(`Property "${propertName} must be a sequence."`);
  }
}
