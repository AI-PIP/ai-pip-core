/**
 * emitSignal - Emits an ISLSignal from an internal ISLResult
 *
 * @remarks
 * Converts ISLResult into a semantic signal (ISLSignal) for AAL/SDK.
 * Aggregates all segment detections (from detectThreats → piDetection);
 * hasThreats and riskScore are derived solely from that aggregation
 * (no separate source of truth). Same ISLResult → same ISLSignal (deterministic).
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
  const allDetections = islResult.segments
    .filter((s): s is typeof s & { piDetection: NonNullable<typeof s.piDetection> } =>
      s.piDetection != null
    )
    .flatMap(s => s.piDetection.detections)

  const piDetection = createPiDetectionResult(allDetections)
  const riskScore = piDetection.detected
    ? createRiskScore(piDetection.score)
    : MIN_RISK_SCORE

  return createISLSignal(riskScore, piDetection, timestamp)
}
