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

const VALID_ACTIONS = new Set<AnomalyAction>(['ALLOW', 'WARN', 'BLOCK'])

function assertBuildDecisionReasonArgs(
  action: AnomalyAction,
  islSignal: ISLSignal,
  policy: AgentPolicy
): void {
  if (action == null || !VALID_ACTIONS.has(action)) {
    throw new TypeError('AAL buildDecisionReason: action must be ALLOW, WARN, or BLOCK')
  }
  if (islSignal == null || typeof islSignal !== 'object') {
    throw new TypeError('AAL buildDecisionReason: islSignal must be a non-null object')
  }
  if (typeof islSignal.riskScore !== 'number') {
    throw new TypeError('AAL buildDecisionReason: islSignal.riskScore must be a number')
  }
  if (policy == null || typeof policy !== 'object') {
    throw new TypeError('AAL buildDecisionReason: policy must be a non-null object')
  }
  const t = policy.thresholds
  if (t == null || typeof t !== 'object' || typeof t.warn !== 'number' || typeof t.block !== 'number') {
    throw new TypeError('AAL buildDecisionReason: policy.thresholds.warn and block must be numbers')
  }
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
  assertBuildDecisionReasonArgs(action, islSignal, policy)

  const detectionCount = islSignal.piDetection?.detections?.length ?? 0
  const hasThreats = islSignal.hasThreats === true && detectionCount > 0

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

  if (hasThreats) {
    reason += `. ${detectionCount} threat(s) detected.`
  }

  return {
    action,
    riskScore: islSignal.riskScore,
    threshold,
    reason,
    hasThreats,
    detectionCount
  }
}
