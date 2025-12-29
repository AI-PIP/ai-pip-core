/**
 * ISL (Instruction Sanitization Layer) - Core Semántico
 * 
 * @remarks
 * ISL sanitiza instrucciones maliciosas recibidas de CSL,
 * aplicando diferentes niveles de sanitización según el nivel de confianza.
 */

// Funciones puras principales
export { sanitize } from './sanitize'

// Value objects
export type { PiDetection, PiDetectionResult, AnomalyScore, Pattern } from './value-objects'
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
  MAX_MATCHES
} from './value-objects'

// Exceptions
export { SanitizationError } from './exceptions/SanitizationError'

// Types
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
  ISLResult
} from './types'

