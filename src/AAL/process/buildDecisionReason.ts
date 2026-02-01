/**
 * buildDecisionReason - Builds the reason for an AAL decision
 * 
 * @remarks
 * This function builds a human-readable description of why
 * a specific decision was made (ALLOW, WARN, BLOCK).
 * 
 * **Responsibility:**
 * - Generate readable decision reasons
 * - Include risk score and threshold information
 * - Facilitate auditing and debugging
 */

import type { AnomalyAction } from '../types.js'
import type { ISLSignal } from '../../isl/signals.js'
import type { AgentPolicy } from '../types.js'

/**
 * Reason for an AAL decision
 */
export interface DecisionReason {
  readonly action: AnomalyAction
  readonly riskScore: number
  readonly threshold: number
  readonly reason: string
  readonly hasThreats: boolean
  readonly detectionCount: number
}

/**
 * Builds the reason for a decision
 * 
 * @param action - Determined action (ALLOW, WARN, BLOCK)
 * @param islSignal - ISL signal that originated the decision
 * @param policy - Applied policy
 * @returns DecisionReason with complete information
 */
export function buildDecisionReason(
  action: AnomalyAction,
  islSignal: ISLSignal,
  policy: AgentPolicy
): DecisionReason {
  let threshold: number
  let reason: string

  if (action === 'BLOCK') {
    threshold = policy.thresholds.block
    reason = `Risk score ${islSignal.riskScore.toFixed(3)} exceeds block threshold ${threshold.toFixed(3)}`
  } else if (action === 'WARN') {
    threshold = policy.thresholds.warn
    reason = `Risk score ${islSignal.riskScore.toFixed(3)} exceeds warn threshold ${threshold.toFixed(3)} but is below block threshold`
  } else {
    threshold = policy.thresholds.warn
    reason = `Risk score ${islSignal.riskScore.toFixed(3)} is below warn threshold ${threshold.toFixed(3)}`
  }

  if (islSignal.hasThreats) {
    reason += `. ${islSignal.piDetection.detections.length} threat(s) detected.`
  }

  return {
    action,
    riskScore: islSignal.riskScore,
    threshold,
    reason,
    hasThreats: islSignal.hasThreats,
    detectionCount: islSignal.piDetection.detections.length
  }
}
