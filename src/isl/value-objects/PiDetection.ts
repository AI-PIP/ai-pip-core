import type { RiskScore } from './RiskScore.js'
import type { Position } from '../../shared/types.js'
/**
 * PiDetection - tipo puro
 */
export type PiDetection = {
  readonly pattern_type: string
  readonly matched_pattern: string
  readonly position: Position
  readonly confidence: RiskScore
}

/**
 * Crea un PiDetection - función pura
 */
export function createPiDetection(
  pattern_type: string,
  matched_pattern: string,
  position: Position,
  confidence: RiskScore
): PiDetection {
  // Validar pattern_type
  if (!pattern_type || typeof pattern_type !== 'string' || pattern_type.trim().length === 0) {
    throw new Error('PiDetection pattern_type must be a non-empty string')
  }

  // Validar matched_pattern
  if (!matched_pattern || typeof matched_pattern !== 'string') {
    throw new Error('PiDetection matched_pattern must be a non-empty string')
  }

  // Validar position
  if (!position || typeof position !== 'object') {
    throw new TypeError('PiDetection position must be an object with start and end properties')
  }

  if (typeof position.start !== 'number' || !Number.isFinite(position.start) || position.start < 0) {
    throw new Error('PiDetection position.start must be a valid non-negative number')
  }

  if (typeof position.end !== 'number' || !Number.isFinite(position.end) || position.end < 0) {
    throw new Error('PiDetection position.end must be a valid non-negative number')
  }

  if (position.end <= position.start) {
    throw new Error('PiDetection position.end must be greater than position.start')
  }

  // Validar confidence
  if (typeof confidence !== 'number' || !Number.isFinite(confidence)) {
    throw new TypeError('PiDetection confidence must be a valid number')
  }

  if (confidence < 0 || confidence > 1) {
    throw new Error('PiDetection confidence must be between 0 and 1')
  }

  // Validar que matched_pattern length coincide con position
  const patternLength = position.end - position.start
  if (matched_pattern.length !== patternLength) {
    throw new Error(
      `PiDetection matched_pattern length (${matched_pattern.length}) does not match position range (${patternLength})`
    )
  }

  return {
    pattern_type: pattern_type.trim(),
    matched_pattern,
    position: Object.freeze({ ...position }),
    confidence
  }
}

/**
 * Funciones puras para PiDetection
 */
export function getDetectionLength(detection: PiDetection): number {
  return detection.position.end - detection.position.start
}

export function isHighConfidence(detection: PiDetection): boolean {
  return detection.confidence >= 0.7
}

export function isMediumConfidence(detection: PiDetection): boolean {
  return detection.confidence >= 0.3 && detection.confidence < 0.7
}

export function isLowConfidence(detection: PiDetection): boolean {
  return detection.confidence < 0.3
}

