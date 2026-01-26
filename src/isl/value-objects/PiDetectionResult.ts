import type { RiskScore } from '../types.js'
import type { PiDetection } from './PiDetection.js'

/**
 * PiDetectionResult - tipo puro
 */
export type PiDetectionResult = {
  readonly detections: readonly PiDetection[]
  readonly score: RiskScore
  readonly patterns: readonly string[]
  readonly detected: boolean
}

/**
 * Calcula score agregado desde detecciones individuales - función pura
 */
function calculateAggregatedScore(detections: readonly PiDetection[]): RiskScore {
  if (detections.length === 0) {
    return 0
  }

  if (detections.length === 1) {
    const first = detections[0]
    if (!first) return 0
    return first.confidence
  }

  // Usar probabilidad complementaria: 1 - (1-c1)*(1-c2)*...
  let complementaryProduct = 1
  for (const detection of detections) {
    complementaryProduct *= (1 - detection.confidence)
  }

  const aggregatedScore = 1 - complementaryProduct
  return Math.max(0, Math.min(1, aggregatedScore))
}


/**
 * Crea un PiDetectionResult - función pura
 */
export function createPiDetectionResult(
  detections: readonly PiDetection[],
): PiDetectionResult {
  // Validar detections array
  if (!Array.isArray(detections)) {
    throw new TypeError('PiDetectionResult detections must be an array')
  }

  // Calcular score agregado
  const score = calculateAggregatedScore(detections)



  // Derivar patterns array
  const patterns: readonly string[] = detections.map((detection: PiDetection) => detection.pattern_type)

  const result: PiDetectionResult = {
    detections: Object.freeze(Array.from(detections)) as readonly PiDetection[],
    score,
    patterns: Object.freeze(Array.from(patterns)),
    detected: detections.length > 0
  }
  
  return result
}

/**
 * Funciones puras para PiDetectionResult
 */
export function hasDetections(result: PiDetectionResult): boolean {
  return result.detected
}

// shouldBlock y shouldWarn NO son core - son decisiones que van a ModelGateway
// El core solo produce señales (score, action), no decide acciones finales

export function getDetectionCount(result: PiDetectionResult): number {
  return result.detections.length
}

export function getDetectionsByType(
  result: PiDetectionResult,
  pattern_type: string
): readonly PiDetection[] {
  return result.detections.filter(detection => detection.pattern_type === pattern_type)
}

export function getHighestConfidenceDetection(
  result: PiDetectionResult
): PiDetection | undefined {
  if (result.detections.length === 0) {
    return undefined
  }

  return result.detections.reduce((highest, current) => {
    return current.confidence > highest.confidence ? current : highest
  })
}

