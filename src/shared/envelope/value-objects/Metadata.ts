/**
 * Envelope metadata – security metadata value object (timestamp, nonce, version).
 *
 * @remarks
 * Immutable; validates timestamp (positive, not in the future) and protocol version.
 */

import type { CPEMetadata, ProtocolVersion, Timestamp } from '../types.js'
import type { Nonce as NonceVO } from './Nonce.js'

/** Current protocol version for envelope metadata */
export const CURRENT_PROTOCOL_VERSION: ProtocolVersion = '0.1.4'

/**
 * Creates envelope metadata (frozen).
 *
 * @param timestamp - Unix timestamp in ms
 * @param nonce - Nonce value object
 * @param protocolVersion - Protocol version (default: CURRENT_PROTOCOL_VERSION)
 * @param previousSignatures - Optional previous layer signatures (csl, isl)
 */
export function createMetadata(
  timestamp: Timestamp,
  nonce: NonceVO,
  protocolVersion: ProtocolVersion = CURRENT_PROTOCOL_VERSION,
  previousSignatures?: { csl?: string; isl?: string }
): CPEMetadata {
  if (timestamp <= 0) {
    throw new Error('Timestamp must be a positive number')
  }

  const maxFutureTimestamp = Date.now() + 5 * 60 * 1000
  if (timestamp > maxFutureTimestamp) {
    throw new Error('Timestamp cannot be in the future')
  }

  if (!protocolVersion || typeof protocolVersion !== 'string') {
    throw new Error('Protocol version must be a non-empty string')
  }

  return Object.freeze({
    timestamp,
    nonce: nonce.value,
    protocolVersion,
    previousSignatures: previousSignatures
      ? Object.freeze({
          csl: previousSignatures.csl ?? undefined,
          isl: previousSignatures.isl ?? undefined,
        })
      : undefined,
  })
}

/**
 * Validates metadata shape and values.
 */
export function isValidMetadata(metadata: CPEMetadata): boolean {
  try {
    if (metadata.timestamp <= 0) return false
    if (!metadata.nonce || metadata.nonce.length < 16) return false
    if (!metadata.protocolVersion) return false
    return true
  } catch {
    return false
  }
}
