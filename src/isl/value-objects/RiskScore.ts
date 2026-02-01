/**
 * RiskScore - Value Object
 * 
 * @remarks
 * Represents a normalized risk value produced by the core semantic layers.
 * 
 * - Value range is **0.0 to 1.0**
 * - `0`   = no risk detected
 * - `1`   = maximum risk confidence
 * 
 * Although this type aliases `number`, it is intentionally defined
 * as a value object to preserve **semantic meaning**, enforce conceptual clarity,
 * and stabilize public contracts across layers and SDKs.
 * 
 * This type MUST NOT be interpreted as a decision signal.
 * Decisions based on RiskScore belong to higher layers (AAL / SDK).
 */

/**
 * RiskScore type - normalized risk value between 0.0 and 1.0
 */
export type RiskScore = number

/**
 * Minimum valid risk score value
 */
export const MIN_RISK_SCORE: RiskScore = 0

/**
 * Maximum valid risk score value
 */
export const MAX_RISK_SCORE: RiskScore = 1

/**
 * Creates a valid RiskScore value
 * 
 * @param value - Numeric value to validate and normalize
 * @returns Validated RiskScore
 * @throws {Error} If value is outside valid range [0.0, 1.0]
 */
export function createRiskScore(value: number): RiskScore {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError('RiskScore must be a finite number')
  }

  if (value < MIN_RISK_SCORE || value > MAX_RISK_SCORE) {
    throw new Error(
      `RiskScore must be between ${MIN_RISK_SCORE} and ${MAX_RISK_SCORE}, got ${value}`
    )
  }

  return value
}

/**
 * Normalizes a risk score to the valid range [0.0, 1.0]
 * 
 * @param value - Numeric value to normalize
 * @returns Normalized RiskScore clamped to [0.0, 1.0]
 */
export function normalizeRiskScore(value: number): RiskScore {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return MIN_RISK_SCORE
  }

  return Math.max(MIN_RISK_SCORE, Math.min(MAX_RISK_SCORE, value))
}

/**
 * Checks if a risk score is considered high
 * 
 * @param score - RiskScore to evaluate
 * @param threshold - Threshold for high risk (default: 0.7)
 * @returns true if score >= threshold
 */
export function isHighRiskScore(score: RiskScore, threshold: number = 0.7): boolean {
  return score >= threshold
}

/**
 * Checks if a risk score is considered medium
 * 
 * @param score - RiskScore to evaluate
 * @param lowThreshold - Lower threshold (default: 0.3)
 * @param highThreshold - Upper threshold (default: 0.7)
 * @returns true if score is in medium range
 */
export function isMediumRiskScore(
  score: RiskScore,
  lowThreshold: number = 0.3,
  highThreshold: number = 0.7
): boolean {
  return score >= lowThreshold && score < highThreshold
}

/**
 * Checks if a risk score is considered low
 * 
 * @param score - RiskScore to evaluate
 * @param threshold - Threshold for low risk (default: 0.3)
 * @returns true if score < threshold
 */
export function isLowRiskScore(score: RiskScore, threshold: number = 0.3): boolean {
  return score < threshold
}
