/**
 * ISL tags – Semantic isolation metadata and canonical serialization (v0.5.0).
 *
 * @remarks
 * - **Namespace & types:** Official namespace, threat tag types (aligned with detect).
 * - **ThreatTag:** Structural metadata (segmentId, offsets, type, confidence); no text mutation.
 * - **Registry:** Valid tag types for validation.
 * - **Serializer:** Canonical AI-PIP tag format (open/close/wrap); protocol-only, no offsets or segment logic.
 *
 * The SDK uses ThreatTag + serializer to insert tags into fragment text; the core only defines the format.
 */

export { AIPIP_NAMESPACE, AIPIP_TAG_SCHEMA_VERSION } from './namespace.js'
export { THREAT_TYPES } from './threat-tag-type.js'
export type { ThreatTagType, ThreatType } from './threat-tag-type.js'
export type { ThreatTag } from './threat-tag.js'
export { createThreatTag } from './threat-tag.js'
export { VALID_TAG_TYPES, isValidThreatTagType } from './tag-registry.js'
export { openTag, closeTag, wrapWithTag } from './serializer.js'
