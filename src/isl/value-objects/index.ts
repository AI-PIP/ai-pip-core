// Tipos
export type { PiDetection } from './PiDetection.js'
export type { PiDetectionResult } from './PiDetectionResult.js'
export type { AnomalyScore } from './AnomalyScore.js'
export type { Pattern } from './Pattern.js'
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
  createAnomalyScore,
  isHighRisk,
  isWarnRisk,
  isLowRisk
} from './AnomalyScore.js'

export {
  createPattern,
  matchesPattern,
  findMatch,
  MAX_CONTENT_LENGTH,
  MAX_PATTERN_LENGTH,
  MAX_MATCHES
} from './Pattern.js'

// PolicyRule NO es core - va a ModelGateway/Policy Engine
// Se mantiene el tipo para compatibilidad pero las funciones de decisión no son core

