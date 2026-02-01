/**
 * ISLSignal - Semantic contract between layers
 * 
 * @remarks
 * ISLSignal is the external signal that ISL emits to be consumed by other layers.
 * 
 * **Purpose:**
 * - Semantic contract between layers (AAL, SDK, Engine)
 * - Does not expose ISL internals
 * - Designed for external consumption without coupling
 * 
 * **Difference with ISLResult:**
 * - ISLResult: Internal result of ISL pipeline (segments, lineage, complete metadata)
 * - ISLSignal: External semantic signal (risk scores, detections, security signals)
 * 
 * **Architectural rule:**
 * A layer should never consume the internal "result" of another layer.
 * It consumes a signal.
 * 
 * @example
 * ```typescript
 * // ISL processes and emits signal
 * const islResult = ISL.process(cslResult)  // Internal
 * const islSignal = ISL.emitSignal(islResult)  // External → AAL
 * 
 * // AAL consumes the signal, not the result
 * const aalDecision = AAL.resolve(islSignal, policy)
 * ```
 */

import type { RiskScore } from './value-objects/RiskScore.js'
import type { PiDetectionResult } from './value-objects/PiDetectionResult.js'

/**
 * ISLSignal - Semantic signal emitted by ISL
 * 
 * Represents the essential information that other layers need
 * to make decisions without knowing ISL's internal details.
 */
export interface ISLSignal {
  /**
   * Aggregated risk score of the processed content.
   * Range: 0.0 (no risk) to 1.0 (maximum risk)
   */
  readonly riskScore: RiskScore

  /**
   * Prompt injection detection result.
   * Contains all detected threats and their aggregated score.
   */
  readonly piDetection: PiDetectionResult

  /**
   * Indicates whether threats were detected in the content.
   * Semantic shortcut for quick verification.
   */
  readonly hasThreats: boolean

  /**
   * Timestamp of when the content was processed.
   * Useful for auditing and traceability.
   */
  readonly timestamp: number
}

/**
 * Creates an ISLSignal from an internal ISLResult
 * 
 * @remarks
 * This function extracts the essential semantic information from the internal result
 * to create a signal that can be consumed by other layers without coupling.
 * 
 * @param riskScore - Risk score value
 * @param piDetection - Prompt injection detection result
 * @param timestamp - Timestamp of the signal (default: Date.now())
 * @returns ISLSignal - Semantic signal for external consumption
 */
export function createISLSignal(
  riskScore: RiskScore,
  piDetection: PiDetectionResult,
  timestamp: number = Date.now()
): ISLSignal {
  // Validar riskScore
  if (typeof riskScore !== 'number' || !Number.isFinite(riskScore)) {
    throw new TypeError('ISLSignal riskScore must be a valid number')
  }

  if (riskScore < 0 || riskScore > 1) {
    throw new Error('ISLSignal riskScore must be between 0 and 1')
  }

  // Validar timestamp
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp) || timestamp < 0) {
    throw new Error('ISLSignal timestamp must be a valid non-negative number')
  }

  return {
    riskScore,
    piDetection,
    hasThreats: piDetection.detected,
    timestamp
  }
}

/**
 * Checks if the signal indicates high risk
 * 
 * @param signal - ISLSignal to evaluate
 * @param threshold - Risk threshold (default: 0.7)
 * @returns true if the risk score exceeds the threshold
 */
export function isHighRiskSignal(signal: ISLSignal, threshold: number = 0.7): boolean {
  return signal.riskScore >= threshold
}

/**
 * Checks if the signal indicates medium risk
 * 
 * @param signal - ISLSignal to evaluate
 * @param lowThreshold - Lower threshold (default: 0.3)
 * @param highThreshold - Upper threshold (default: 0.7)
 * @returns true if the risk score is in the medium range
 */
export function isMediumRiskSignal(
  signal: ISLSignal,
  lowThreshold: number = 0.3,
  highThreshold: number = 0.7
): boolean {
  return signal.riskScore >= lowThreshold && signal.riskScore < highThreshold
}

/**
 * Checks if the signal indicates low risk
 * 
 * @param signal - ISLSignal to evaluate
 * @param threshold - Risk threshold (default: 0.3)
 * @returns true if the risk score is below the threshold
 */
export function isLowRiskSignal(signal: ISLSignal, threshold: number = 0.3): boolean {
  return signal.riskScore < threshold
}
