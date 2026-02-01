/**
 * resolveAgentAction - Resolves agent action based on ISL signals and policies
 * 
 * @remarks
 * This function takes an ISL signal and an agent policy,
 * and determines what action the agent should take (ALLOW, WARN, BLOCK).
 * 
 * **Responsibility:**
 * - Evaluate ISL signals against policy thresholds
 * - Determine semantic action (does not execute the action)
 * - Return decision based on risk score and thresholds
 */

import type { ISLSignal } from '../../isl/signals.js'
import type { AgentPolicy, AnomalyAction } from '../types.js'
import { createAnomalyScore } from '../value-objects/AnomalyScore.js'

/**
 * Resolves agent action based on ISL signal and policy
 * 
 * @param islSignal - Signal emitted by ISL
 * @param policy - Agent policy with thresholds
 * @returns AnomalyAction (ALLOW, WARN, BLOCK)
 */
export function resolveAgentAction(
  islSignal: ISLSignal,
  policy: AgentPolicy
): AnomalyAction {
  const riskScore = islSignal.riskScore

  // Evaluate policy thresholds
  if (riskScore >= policy.thresholds.block) {
    return 'BLOCK'
  }

  if (riskScore >= policy.thresholds.warn) {
    return 'WARN'
  }

  return 'ALLOW'
}

/**
 * Resolves agent action and returns a complete AnomalyScore
 * 
 * @param islSignal - Signal emitted by ISL
 * @param policy - Agent policy with thresholds
 * @returns AnomalyScore with score and action
 */
export function resolveAgentActionWithScore(
  islSignal: ISLSignal,
  policy: AgentPolicy
) {
  const action = resolveAgentAction(islSignal, policy)
  return createAnomalyScore(islSignal.riskScore, action)
}
