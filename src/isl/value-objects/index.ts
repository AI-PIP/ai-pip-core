// Tipos
export type { PiDetection } from './PiDetection.js'
export type { PiDetectionResult } from './PiDetectionResult.js'
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
  createPattern,
  matchesPattern,
  findMatch,
  MAX_CONTENT_LENGTH,
  MAX_PATTERN_LENGTH,
  MAX_MATCHES
} from './Pattern.js'



