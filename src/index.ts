/**
 * @ai-pip/core - Core implementation of the AI-PIP protocol
 * 
 * @remarks
 * Main entry point that re-exports all layers (CSL, ISL, Shared)
 * 
 * You can also import specific layers:
 * - import { segment } from '@ai-pip/core/csl'
 * - import { sanitize } from '@ai-pip/core/isl'
 * - import { addLineageEntry } from '@ai-pip/core/shared'
 * - import { envelope } from '@ai-pip/core/cpe'
 */

// Re-export CSL
export {
  segment,
  classifySource,
  classifyOrigin,
  initLineage,
  createLineageEntry,
  generateId,
  splitByContextRules,
  OriginType,
  TrustLevelType,
  ClassificationError,
  SegmentationError
} from './csl'
export type {
  HashAlgorithm,
  Source,
  CSLInput,
  CSLSegment,
  CSLResult,
  TrustLevel,
  Origin,
  LineageEntry,
  ContentHash
} from './csl'

// Re-export ISL
export { sanitize } from './isl'
export type {
  RiskScore,
  AnomalyAction,
  Position,
  BlockedIntent,
  SensitiveScope,
  ProtectedRole,
  ImmutableInstruction,
  RemovedInstruction,
  ISLSegment,
  ISLResult,
  PiDetection,
  PiDetectionResult,
  AnomalyScore,
  Pattern
} from './isl'
export {
  createPiDetection,
  getDetectionLength,
  isHighConfidence,
  isMediumConfidence,
  isLowConfidence,
  createPiDetectionResult,
  hasDetections,
  getDetectionCount,
  getDetectionsByType,
  getHighestConfidenceDetection,
  createAnomalyScore,
  isHighRisk,
  isWarnRisk,
  isLowRisk,
  createPattern,
  matchesPattern,
  findMatch,
  MAX_CONTENT_LENGTH,
  MAX_PATTERN_LENGTH,
  MAX_MATCHES,
  SanitizationError
} from './isl'

// Re-export Shared
export {
  addLineageEntry,
  addLineageEntries,
  filterLineageByStep,
  getLastLineageEntry
} from './shared'

// Re-export CPE
export { envelope, createNonce, isValidNonce, equalsNonce, createMetadata, isValidMetadata, CURRENT_PROTOCOL_VERSION, createSignature, EnvelopeError } from './cpe'
export type { Nonce, SignatureVO, ProtocolVersion, Timestamp, NonceValue, SignatureAlgorithm, Signature, CPEMetadata, CPEEvelope, CPEResult } from './cpe'


