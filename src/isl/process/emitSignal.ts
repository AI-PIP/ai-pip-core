/**
 * emitSignal - Emits an ISLSignal from an internal ISLResult
 *
 * @remarks
 * Converts ISLResult into a semantic signal (ISLSignal) for AAL/SDK.
 * Aggregates all segment detections (from detectThreats → piDetection);
 * hasThreats and riskScore are derived solely from that aggregation
 * (no separate source of truth). Same ISLResult + same options → same ISLSignal (deterministic).
 * Strategy is fixed at emit time; reflected in ISLSignal.metadata for auditability.
 */

import type { ISLResult } from '../types.js'
import type { ISLSignal } from '../signals.js'
import { createISLSignal } from '../signals.js'
import { createPiDetectionResult } from '../value-objects/PiDetectionResult.js'
import { MIN_RISK_SCORE, normalizeRiskScore } from '../value-objects/RiskScore.js'
import { RiskScoreStrategy } from '../riskScore/types.js'
import { getCalculator } from '../riskScore/index.js'

/** Options for emitSignal. Strategy decided once; no per-segment or dynamic strategy. */
export interface EmitSignalOptions {
  /** Signal timestamp (default: Date.now()) */
  readonly timestamp?: number
  /** Risk score strategy and optional type weights (default: MAX_CONFIDENCE) */
  readonly riskScore?: {
    readonly strategy: RiskScoreStrategy
    readonly typeWeights?: Record<string, number>
  }
}

const DEFAULT_STRATEGY = RiskScoreStrategy.MAX_CONFIDENCE

/**
 * Emits an ISLSignal from an internal ISLResult
 *
 * @param islResult - Internal ISL result
 * @param options - Optional timestamp and risk score strategy (default: MAX_CONFIDENCE)
 * @returns ISLSignal - Semantic signal for external consumption; metadata.strategy reflects strategy used
 */
export function emitSignal(
  islResult: ISLResult,
  options: EmitSignalOptions | number = {}
): ISLSignal {
  const opts: EmitSignalOptions =
    typeof options === 'number' ? { timestamp: options } : options
  const timestamp = opts.timestamp ?? Date.now()
  const strategy = opts.riskScore?.strategy ?? DEFAULT_STRATEGY
  const typeWeights = opts.riskScore?.typeWeights

  const allDetections = islResult.segments
    .filter((s): s is typeof s & { piDetection: NonNullable<typeof s.piDetection> } =>
      s.piDetection != null
    )
    .flatMap(s => s.piDetection.detections)

  const piDetection = createPiDetectionResult(allDetections)
  const calculator = getCalculator(strategy, typeWeights)
  const rawScore = calculator.calculate(allDetections)
  const riskScore = allDetections.length === 0
    ? MIN_RISK_SCORE
    : normalizeRiskScore(rawScore)

  const metadata = Object.freeze({ strategy })
  return createISLSignal(riskScore, piDetection, timestamp, metadata)
}
