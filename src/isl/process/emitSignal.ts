/**
 * emitSignal - Emits an ISLSignal from an internal ISLResult
 * 
 * @remarks
 * This function converts the internal ISL result (ISLResult)
 * into a semantic signal (ISLSignal) that can be consumed by other layers.
 * 
 * **Responsibility:**
 * - Extract essential semantic information from internal result
 * - Create signal without exposing ISL internals
 * - Add risk score and detections
 */

import type { ISLResult } from '../types.js'
import type { ISLSignal } from '../signals.js'
import { createISLSignal } from '../signals.js'
import { createPiDetectionResult } from '../value-objects/PiDetectionResult.js'
import { MIN_RISK_SCORE, createRiskScore } from '../value-objects/RiskScore.js'

/**
 * Emits an ISLSignal from an internal ISLResult
 * 
 * @param islResult - Internal ISL result
 * @param timestamp - Signal timestamp (default: Date.now())
 * @returns ISLSignal - Semantic signal for external consumption
 */
export function emitSignal(
  islResult: ISLResult,
  timestamp: number = Date.now()
): ISLSignal {
  // Aggregate all detections from all segments
  const allDetections = islResult.segments
    .filter(segment => segment.piDetection)
    .flatMap(segment => segment.piDetection?.detections ?? [])

  // Create aggregated detection result
  const piDetection = createPiDetectionResult(allDetections)

  // Calculate aggregated risk score
  // If there are detections, use the detection result score
  // If no detections, use minimum score
  const riskScore = piDetection.detected
    ? createRiskScore(piDetection.score)
    : MIN_RISK_SCORE

  // Create and return signal
  return createISLSignal(riskScore, piDetection, timestamp)
}
