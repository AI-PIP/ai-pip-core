/**
 * Signature – HMAC-SHA256 cryptographic signature. Immutable value object.
 *
 * @remarks
 * Used by the envelope to sign payload + metadata; verification is responsibility of the SDK.
 */

import { createHmac } from 'node:crypto'
import type { SignatureAlgorithm } from '../types.js'

export type SignatureVO = {
  readonly value: string
  readonly algorithm: SignatureAlgorithm
}

/**
 * Creates HMAC-SHA256 signature of the given content.
 *
 * @param content - String to sign (e.g. JSON.stringify(payload + metadata))
 * @param secretKey - Secret key for HMAC (must not be logged or serialized)
 * @returns Frozen Signature value object
 */
export function createSignature(content: string, secretKey: string): SignatureVO {
  if (!secretKey || secretKey.length === 0) {
    throw new Error('Secret key is required for signature generation')
  }

  if (typeof content !== 'string') {
    throw new TypeError('Content must be a string')
  }

  const hmac = createHmac('sha256', secretKey)
  hmac.update(content)
  const signature = hmac.digest('hex')

  return Object.freeze({
    value: signature,
    algorithm: 'HMAC-SHA256',
  })
}

/**
 * Verifies that a signature matches the content (constant-time comparison should be used in production).
 */
export function verifySignature(
  content: string,
  signature: string,
  secretKey: string
): boolean {
  if (!secretKey || secretKey.length === 0) return false
  try {
    const expected = createSignature(content, secretKey)
    return expected.value === signature
  } catch {
    return false
  }
}

/**
 * Validates signature format (64 hex chars for HMAC-SHA256).
 */
export function isValidSignatureFormat(signature: string): boolean {
  return /^[a-f0-9]{64}$/i.test(signature)
}
