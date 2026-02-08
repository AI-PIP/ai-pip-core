/**
 * Envelope types (transversal) – integrity and anti-replay
 *
 * @remarks
 * The envelope is a cross-cutting concern: it wraps the pipeline result
 * (e.g. ISL or AAL output) with metadata, nonce, and HMAC signature.
 * It is not a processing layer; it applies to the result of the pipeline.
 */

import type { LineageEntry } from '../../csl/value-objects/index.js'

/** Protocol version string (e.g. "0.1.4") */
export type ProtocolVersion = string

/** Unix timestamp in milliseconds */
export type Timestamp = number

/** Nonce value for replay prevention */
export type NonceValue = string

/** Supported signature algorithm */
export type SignatureAlgorithm = 'HMAC-SHA256'

/** Signature value (hex string) */
export type Signature = string

/** Envelope security metadata: timestamp, nonce, protocol version, optional previous signatures */
export interface CPEMetadata {
  readonly timestamp: Timestamp
  readonly nonce: NonceValue
  readonly protocolVersion: ProtocolVersion
  readonly previousSignatures?: {
    readonly csl?: string | undefined
    readonly isl?: string | undefined
  } | undefined
}

/** Full cryptographic envelope: payload, metadata, signature, lineage */
export interface CPEEvelope {
  readonly payload: unknown
  readonly metadata: CPEMetadata
  readonly signature: {
    readonly value: string
    readonly algorithm: string
  }
  readonly lineage: readonly LineageEntry[]
}

/** Result of envelope generation (envelope + optional processing time) */
export interface CPEResult {
  readonly envelope: CPEEvelope
  readonly processingTimeMs?: number
}
