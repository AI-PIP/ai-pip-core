/**
 * ThreatTag – Structural metadata for semantic isolation (v0.5.0).
 *
 * @remarks
 * ISL produces ThreatTag objects: segment id, offsets into the segment content,
 * threat type, and confidence. The core does not insert tags into text; the SDK
 * uses this metadata plus the canonical serializer to wrap fragments.
 *
 * Offsets are relative to the original segment content (immutable). start is
 * inclusive, end is exclusive [start, end).
 */

import type { ThreatTagType } from './threat-tag-type.js'
import { VALID_TAG_TYPES } from './tag-registry.js'

export interface ThreatTag {
  /** Segment that contains the detected fragment */
  readonly segmentId: string
  /** Start offset (inclusive) into segment content */
  readonly startOffset: number
  /** End offset (exclusive) into segment content */
  readonly endOffset: number
  /** Threat type (aligns with detection taxonomy) */
  readonly type: ThreatTagType
  /** Confidence in [0, 1] */
  readonly confidence: number
}

/**
 * Creates a ThreatTag (frozen). Validates segmentId, offsets, type, and confidence.
 *
 * @throws {TypeError} If segmentId or type is invalid
 * @throws {RangeError} If offsets or confidence are out of range
 */
export function createThreatTag(
  segmentId: string,
  startOffset: number,
  endOffset: number,
  type: ThreatTagType,
  confidence: number
): ThreatTag {
  if (segmentId == null || typeof segmentId !== 'string' || segmentId.trim().length === 0) {
    throw new TypeError('ThreatTag segmentId must be a non-empty string')
  }
  if (typeof startOffset !== 'number' || !Number.isFinite(startOffset) || startOffset < 0) {
    throw new RangeError('ThreatTag startOffset must be a non-negative finite number')
  }
  if (typeof endOffset !== 'number' || !Number.isFinite(endOffset) || endOffset < startOffset) {
    throw new RangeError('ThreatTag endOffset must be >= startOffset')
  }
  if (!VALID_TAG_TYPES.includes(type)) {
    throw new TypeError(`ThreatTag type must be one of: ${VALID_TAG_TYPES.join(', ')}`)
  }
  if (typeof confidence !== 'number' || !Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new RangeError('ThreatTag confidence must be a number in [0, 1]')
  }
  return Object.freeze({
    segmentId: segmentId.trim(),
    startOffset,
    endOffset,
    type,
    confidence
  })
}
