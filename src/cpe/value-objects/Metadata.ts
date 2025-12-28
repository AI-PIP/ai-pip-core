/**
 * CPEMetadata - Metadata de seguridad del envelope
 * Value Object puro e inmutable
 */

import type { CPEMetadata, ProtocolVersion, Timestamp } from '../types'
import type { Nonce as NonceVO } from './Nonce'

/**
 * Versión actual del protocolo
 */
export const CURRENT_PROTOCOL_VERSION: ProtocolVersion = '1.0.0'

/**
 * Crea metadata de seguridad para el envelope
 * Según especificación: timestamp, nonce, protocolVersion, previousSignatures opcionales
 * 
 * @param timestamp - Timestamp Unix en milisegundos
 * @param nonce - Nonce único
 * @param protocolVersion - Versión del protocolo (default: CURRENT_PROTOCOL_VERSION)
 * @param previousSignatures - Firmas opcionales de capas anteriores (csl, isl)
 * @returns CPEMetadata inmutable
 */
export function createMetadata(
  timestamp: Timestamp,
  nonce: NonceVO,
  protocolVersion: ProtocolVersion = CURRENT_PROTOCOL_VERSION,
  previousSignatures?: {
    csl?: string
    isl?: string
  }
): CPEMetadata {
  // Validar timestamp
  if (timestamp <= 0) {
    throw new Error('Timestamp must be a positive number')
  }

  // Validar que no sea del futuro (con margen de 5 minutos para sincronización)
  const maxFutureTimestamp = Date.now() + 5 * 60 * 1000
  if (timestamp > maxFutureTimestamp) {
    throw new Error('Timestamp cannot be in the future')
  }

  // Validar version del protocolo
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
 * Valida que la metadata sea válida
 * 
 * @param metadata - Metadata a validar
 * @returns true si es válida
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

