/**
 * SegmentationError is thrown when the segmentation process fails.
 * 
 * @remarks
 * This error is thrown when:
 * - Content segmentation fails
 * - Critical pipeline steps fail
 */
export class SegmentationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'SegmentationError'
    Object.setPrototypeOf(this, SegmentationError.prototype)
  }
}

