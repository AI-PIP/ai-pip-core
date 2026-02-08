/**
 * Nonce – unique value for replay prevention. Immutable value object.
 *
 * @remarks
 * Used by the envelope to bind each wrapped result to a unique value;
 * verification layer (SDK) should reject duplicate nonces within a time window.
 */

import { randomBytes } from 'node:crypto'

export type Nonce = {
  readonly value: string
}

/**
 * Creates a unique nonce (default 16 bytes, hex-encoded).
 *
 * @param length - Length in bytes (8–64)
 * @returns Frozen Nonce value object
 */
export function createNonce(length: number = 16): Nonce {
  if (length < 8) {
    throw new Error('Nonce length must be at least 8 bytes')
  }
  if (length > 64) {
    throw new Error('Nonce length must be at most 64 bytes')
  }

  const bytes = randomBytes(length)
  const value = bytes.toString('hex')

  return Object.freeze({ value })
}

/**
 * Validates that a string is a valid nonce format (hex, 16–128 chars).
 */
export function isValidNonce(value: string): boolean {
  return /^[a-f0-9]{16,128}$/i.test(value)
}

/**
 * Compares two nonces for equality.
 */
export function equalsNonce(nonce1: Nonce, nonce2: Nonce): boolean {
  return nonce1.value === nonce2.value
}
