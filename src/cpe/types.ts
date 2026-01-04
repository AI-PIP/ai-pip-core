/**
 * Types for CPE (Cryptographic Prompt Envelope) - Core Semántico
 */

// Importar tipos de CSL
import type { LineageEntry } from '../csl/value-objects/index.js'

/**
 * ProtocolVersion - Versión del protocolo AI-PIP
 */
export type ProtocolVersion = string

/**
 * Timestamp - Timestamp Unix en milisegundos
 */
export type Timestamp = number

/**
 * NonceValue - Valor único para prevenir ataques de replay (string)
 */
export type NonceValue = string

/**
 * SignatureAlgorithm - Algoritmo de firma criptográfica
 */
export type SignatureAlgorithm = 'HMAC-SHA256'

/**
 * Signature - Firma criptográfica del envelope
 */
export type Signature = string

/**
 * CPEMetadata - Metadata de seguridad del envelope
 * Según especificación: timestamp, nonce, protocolVersion, previousSignatures opcionales
 */
export interface CPEMetadata {
  readonly timestamp: Timestamp
  readonly nonce: NonceValue
  readonly protocolVersion: ProtocolVersion
  readonly previousSignatures?: {
    readonly csl?: string | undefined
    readonly isl?: string | undefined
  } | undefined
}

/**
 * CPEEvelope - Envoltorio criptográfico completo
 * Según especificación: payload, metadata, signature (value + algorithm), lineage
 */
export interface CPEEvelope {
  readonly payload: unknown  // Payload semántico (contenido procesado)
  readonly metadata: CPEMetadata
  readonly signature: {
    readonly value: string
    readonly algorithm: string
  }
  readonly lineage: readonly LineageEntry[]
}

/**
 * CPEResult - Resultado de la generación del envelope
 */
export interface CPEResult {
  readonly envelope: CPEEvelope
  readonly processingTimeMs?: number
}

