/**
 * envelope – builds a cryptographic envelope around pipeline result (transversal).
 *
 * @remarks
 * The envelope is a cross-cutting concern: it wraps the result of the pipeline
 * (e.g. ISL result or AAL-cleaned result) with integrity and anti-replay guarantees:
 * - Metadata: timestamp, nonce, protocol version
 * - Signature: HMAC-SHA256 over payload + metadata
 * - Lineage: appends an envelope step to the existing lineage
 *
 * This is not a processing layer; it applies to whatever output the SDK chooses
 * to wrap (after ISL or after AAL). Serialization and verification belong in the SDK.
 *
 * @param islResult - Pipeline result with segments (e.g. ISLResult); must have at least one segment
 * @param secretKey - Secret key for HMAC (must not be logged or serialized)
 * @returns CPEResult with envelope and optional processingTimeMs
 * @throws {EnvelopeError} If input is invalid or generation fails
 */
import type { ISLResult } from '../../isl/types.js'
import type { CPEEvelope, CPEResult } from './types.js'
import { createNonce } from './value-objects/Nonce.js'
import { createMetadata } from './value-objects/Metadata.js'
import { createSignature } from './value-objects/Signature.js'
import { EnvelopeError } from './exceptions/index.js'
import { addLineageEntries } from '../lineage.js'
import { createLineageEntry } from '../../csl/value-objects/LineageEntry.js'

export function envelope(islResult: ISLResult, secretKey: string): CPEResult {
  const startTime = Date.now()

  try {
    if (!islResult?.segments?.length) {
      throw new EnvelopeError('ISLResult must contain at least one segment')
    }

    if (!secretKey || secretKey.length === 0) {
      throw new EnvelopeError('Secret key is required for envelope generation')
    }

    const timestamp = Date.now()
    const nonce = createNonce()
    const metadata = createMetadata(timestamp, nonce)

    const payload: unknown = {
      segments: islResult.segments.map((segment) => ({
        id: segment.id,
        content: segment.sanitizedContent,
        trust: segment.trust.value,
        sanitizationLevel: segment.sanitizationLevel,
      })),
    }

    const algorithm = 'HMAC-SHA256'
    const signableContent = JSON.stringify({
      payload,
      metadata,
      algorithm,
    })
    const signatureVO = createSignature(signableContent, secretKey)

    const envelopeLineageEntry = createLineageEntry('CPE', timestamp)
    const updatedLineage = addLineageEntries(islResult.lineage, [envelopeLineageEntry])

    const envelopeResult: CPEEvelope = {
      payload,
      metadata,
      signature: {
        value: signatureVO.value,
        algorithm: signatureVO.algorithm,
      },
      lineage: updatedLineage,
    }

    const processingTime = Date.now() - startTime

    return Object.freeze({
      envelope: envelopeResult,
      processingTimeMs: processingTime,
    })
  } catch (error) {
    if (error instanceof EnvelopeError) {
      throw error
    }
    throw new EnvelopeError(
      `Failed to generate envelope: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    )
  }
}
