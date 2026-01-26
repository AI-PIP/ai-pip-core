/**
 * ISL (Instruction Sanitization Layer) - Core Semántico
 * 
 * @remarks
 * ISL sanitiza instrucciones maliciosas recibidas de CSL,
 * aplicando diferentes niveles de sanitización según el nivel de confianza.
 */

// Funciones puras principales
export { sanitize } from './sanitize.js'

// Value objects
export type { PiDetection, PiDetectionResult, Pattern } from './value-objects/index.js'
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
  MAX_MATCHES
} from './value-objects/index.js'

// Exceptions
export { SanitizationError } from './exceptions/SanitizationError.js'

// Types
export type {
  RiskScore,
  ISLSegment,
  ISLResult
} from './types.js'

