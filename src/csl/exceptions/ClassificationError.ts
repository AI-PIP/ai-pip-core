/**
 * ClassificationError is thrown when classification fails.
 * 
 * @remarks
 * This error is thrown when:
 * - An origin type is not mapped in originMap
 * - Classification cannot be determined
 */
export class ClassificationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ClassificationError'
    Object.setPrototypeOf(this, ClassificationError.prototype)
  }
}

