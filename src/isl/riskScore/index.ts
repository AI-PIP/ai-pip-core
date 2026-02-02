/**
 * ISL risk score strategy - registered calculators only.
 */

export { RiskScoreStrategy } from './types.js'
export type { RiskScoreCalculator } from './types.js'
export {
  maxConfidenceCalculator,
  severityPlusVolumeCalculator,
  weightedByTypeCalculator,
  defaultWeightedByTypeCalculator,
  DEFAULT_TYPE_WEIGHTS
} from './calculators.js'

import { RiskScoreStrategy } from './types.js'
import type { RiskScoreCalculator } from './types.js'
import {
  defaultWeightedByTypeCalculator,
  maxConfidenceCalculator,
  severityPlusVolumeCalculator,
  weightedByTypeCalculator
} from './calculators.js'

/**
 * Returns the registered calculator for the given strategy.
 * For WEIGHTED_BY_TYPE without custom weights, uses default weights.
 */
export function getCalculator(
  strategy: RiskScoreStrategy,
  typeWeights?: Record<string, number>
): RiskScoreCalculator {
  switch (strategy) {
    case RiskScoreStrategy.MAX_CONFIDENCE:
      return maxConfidenceCalculator
    case RiskScoreStrategy.SEVERITY_PLUS_VOLUME:
      return severityPlusVolumeCalculator
    case RiskScoreStrategy.WEIGHTED_BY_TYPE:
      return typeWeights == null
        ? defaultWeightedByTypeCalculator
        : weightedByTypeCalculator(typeWeights)
    default:
      return maxConfidenceCalculator
  }
}
