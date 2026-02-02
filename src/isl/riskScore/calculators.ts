/**
 * Risk score calculators - pure, deterministic, no side effects.
 * Only registered implementations; no custom inline strategies.
 */

import { RiskScoreStrategy } from './types.js'
import type { RiskScoreCalculator } from './types.js'
import type { PiDetection } from '../value-objects/PiDetection.js'

/** Max confidence among all detections. Simple default. */
export const maxConfidenceCalculator: RiskScoreCalculator = {
  strategy: RiskScoreStrategy.MAX_CONFIDENCE,
  calculate(detections: readonly PiDetection[]): number {
    if (detections.length === 0) return 0
    return Math.max(...detections.map((d) => d.confidence))
  }
}

/** Max confidence plus a small bump per extra detection (volume). Clamped by caller. */
export const severityPlusVolumeCalculator: RiskScoreCalculator = {
  strategy: RiskScoreStrategy.SEVERITY_PLUS_VOLUME,
  calculate(detections: readonly PiDetection[]): number {
    if (detections.length === 0) return 0
    const max = Math.max(...detections.map((d) => d.confidence))
    return Math.min(1, max + 0.1 * (detections.length - 1))
  }
}

/**
 * Weighted by pattern_type. Weights default to 1 if type not present.
 * Returns a registered calculator (no inline custom logic).
 */
export function weightedByTypeCalculator(
  weights: Record<string, number>
): RiskScoreCalculator {
  return {
    strategy: RiskScoreStrategy.WEIGHTED_BY_TYPE,
    calculate(detections: readonly PiDetection[]): number {
      if (detections.length === 0) return 0
      const w = (d: PiDetection) => d.confidence * (weights[d.pattern_type] ?? 1)
      return Math.min(1, Math.max(...detections.map(w)))
    }
  }
}

/** Default weights for WEIGHTED_BY_TYPE (all 1). Use for reproducible audits. */
export const DEFAULT_TYPE_WEIGHTS: Record<string, number> = Object.freeze({
  'prompt-injection': 1,
  jailbreak: 1,
  role_hijacking: 1,
  script_like: 1,
  hidden_text: 1
})

/** Pre-built weighted calculator with default weights. */
export const defaultWeightedByTypeCalculator: RiskScoreCalculator =
  weightedByTypeCalculator({ ...DEFAULT_TYPE_WEIGHTS })
