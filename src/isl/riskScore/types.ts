/**
 * Risk score strategy - registered strategies only (auditability, reproducibility).
 * AAL and SDK do not choose the formula; the caller of emitSignal/sanitize does.
 */

import type { PiDetection } from '../value-objects/PiDetection.js'

/** Registered risk score strategies. No custom inline strategies . */
export enum RiskScoreStrategy {
  MAX_CONFIDENCE = 'max-confidence',
  SEVERITY_PLUS_VOLUME = 'severity-plus-volume',
  WEIGHTED_BY_TYPE = 'weighted-by-type'
}

/**
 * Pure, deterministic calculator: detections → raw score (caller clamps to [0,1]).
 * Strategy is fixed per calculator; no side effects.
 */
export interface RiskScoreCalculator {
  readonly strategy: RiskScoreStrategy
  calculate(detections: readonly PiDetection[]): number
}
