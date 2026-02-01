// Tipos
export type { PiDetection } from './PiDetection.js'
export type { PiDetectionResult } from './PiDetectionResult.js'
export type { Pattern, PatternMatch } from './Pattern.js'
export type { RiskScore } from './RiskScore.js'
// Funciones de creación
export {
  createPiDetection,
  getDetectionLength,
  isHighConfidence,
  isMediumConfidence,
  isLowConfidence
} from './PiDetection.js'

export {
  createPiDetectionResult,
  hasDetections,
  getDetectionCount,
  getDetectionsByType,
  getHighestConfidenceDetection
} from './PiDetectionResult.js'



export {
  createPattern,
  matchesPattern,
  findMatch,
  findAllMatches,
  MAX_CONTENT_LENGTH,
  MAX_PATTERN_LENGTH,
  MAX_MATCHES
} from './Pattern.js'

export {
  createRiskScore,
  normalizeRiskScore,
  isHighRiskScore,
  isMediumRiskScore,
  isLowRiskScore,
  MIN_RISK_SCORE,
  MAX_RISK_SCORE
} from './RiskScore.js'



