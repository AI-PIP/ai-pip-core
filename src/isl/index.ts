/**
 * ISL (Instruction Sanitization Layer) - Semantic Core
 * 
 * @remarks
 * ISL sanitizes malicious instructions received from CSL,
 * applying different sanitization levels according to trust level.
 * 
 * **Architecture:**
 * - ISL processes content and emits signals (ISLSignal) for other layers
 * - ISLResult is internal, ISLSignal is the external semantic contract
 * - A layer should never consume the internal "result" of another layer
 */

// Main pure functions
export { sanitize } from './sanitize.js'

// Process functions
export { buildISLResult, emitSignal } from './process/index.js'
export type { EmitSignalOptions } from './process/index.js'

// Detect - threat detection (pure, deterministic)
export { detectThreats, getDefaultThreatPatterns, THREAT_TYPES } from './detect/index.js'
export type { DetectThreatsOptions, ThreatType } from './detect/index.js'

// Lineage functions
export { buildISLLineage } from './lineage/index.js'

// Signals - Semantic contract between layers
export type { ISLSignal, ISLSignalMetadata } from './signals.js'
export {
  createISLSignal,
  isHighRiskSignal,
  isMediumRiskSignal,
  isLowRiskSignal
} from './signals.js'

// Risk score strategy - registered calculators only (auditability, reproducibility)
export { RiskScoreStrategy, getCalculator } from './riskScore/index.js'
export type { RiskScoreCalculator } from './riskScore/types.js'
export {
  maxConfidenceCalculator,
  severityPlusVolumeCalculator,
  weightedByTypeCalculator,
  defaultWeightedByTypeCalculator,
  DEFAULT_TYPE_WEIGHTS
} from './riskScore/index.js'

// Value objects
export type { PiDetection, PiDetectionResult, Pattern, RiskScore } from './value-objects/index.js'
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
  createPattern,
  matchesPattern,
  findMatch,
  MAX_CONTENT_LENGTH,
  MAX_PATTERN_LENGTH,
  MAX_MATCHES,
  createRiskScore,
  normalizeRiskScore,
  isHighRiskScore,
  isMediumRiskScore,
  isLowRiskScore,
  MIN_RISK_SCORE,
  MAX_RISK_SCORE
} from './value-objects/index.js'

// Exceptions
export { SanitizationError } from './exceptions/SanitizationError.js'

// Types
export type {
  RiskScore as RiskScoreType,
  ISLSegment,
  ISLResult
} from './types.js'

