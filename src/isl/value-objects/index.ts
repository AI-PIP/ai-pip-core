// Tipos
export type { PiDetection } from './PiDetection'
export type { PiDetectionResult } from './PiDetectionResult'
export type { AnomalyScore } from './AnomalyScore'
export type { Pattern } from './Pattern'
// Funciones de creación
export {
  createPiDetection,
  getDetectionLength,
  isHighConfidence,
  isMediumConfidence,
  isLowConfidence
} from './PiDetection'

export {
  createPiDetectionResult,
  hasDetections,
  getDetectionCount,
  getDetectionsByType,
  getHighestConfidenceDetection
} from './PiDetectionResult'

export {
  createAnomalyScore,
  isHighRisk,
  isWarnRisk,
  isLowRisk
} from './AnomalyScore'

export {
  createPattern,
  matchesPattern,
  findMatch,
  MAX_CONTENT_LENGTH,
  MAX_PATTERN_LENGTH,
  MAX_MATCHES
} from './Pattern'

// PolicyRule NO es core - va a ModelGateway/Policy Engine
// Se mantiene el tipo para compatibilidad pero las funciones de decisión no son core

