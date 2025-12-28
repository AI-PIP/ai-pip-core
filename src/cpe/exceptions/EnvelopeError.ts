/**
 * EnvelopeError - Error al generar el envelope criptográfico
 */
export class EnvelopeError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message)
    this.name = 'EnvelopeError'
    Object.setPrototypeOf(this, EnvelopeError.prototype)
  }
}

