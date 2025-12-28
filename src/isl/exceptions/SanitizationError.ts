/**
 * SanitizationError is thrown when sanitization fails.
 */
export class SanitizationError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'SanitizationError'
    Object.setPrototypeOf(this, SanitizationError.prototype)
  }
}

