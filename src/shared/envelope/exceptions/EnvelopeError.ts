/**
 * EnvelopeError – raised when envelope generation or validation fails.
 */
export class EnvelopeError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message)
    this.name = 'EnvelopeError'
    Object.setPrototypeOf(this, EnvelopeError.prototype)
  }
}
