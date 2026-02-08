/**
 * validateAgentPolicyThresholds - Validates AAL policy thresholds.
 *
 * @remarks
 * Ensures policy is coherent: warn and block must be in [0, 1] and warn < block.
 * Invalid configuration (e.g. block < warn) would lead to inconsistent decisions
 * (e.g. WARN range empty or unreachable). Call this before using the policy
 * in resolveAgentAction, buildDecisionReason, or buildRemediationPlan.
 */

import type { AgentPolicy } from '../types.js'

/**
 * Validates that policy.thresholds.warn and block are numbers in [0, 1]
 * and that warn < block.
 *
 * @param policy - Agent policy to validate
 * @throws {TypeError} If policy is null/undefined or thresholds are missing/invalid
 * @throws {RangeError} If warn or block are outside [0, 1] or if warn >= block
 */
export function validateAgentPolicyThresholds(policy: AgentPolicy): void {
  if (policy == null || typeof policy !== 'object') {
    throw new TypeError('AAL policy must be a non-null object')
  }
  const t = policy.thresholds
  if (t == null || typeof t !== 'object') {
    throw new TypeError('AAL policy.thresholds must be defined')
  }
  if (typeof t.warn !== 'number' || typeof t.block !== 'number') {
    throw new TypeError('AAL policy.thresholds.warn and block must be numbers')
  }
  const { warn, block } = t
  if (warn < 0 || warn > 1) {
    throw new RangeError(
      `AAL policy.thresholds.warn must be in [0, 1], got ${warn}`
    )
  }
  if (block < 0 || block > 1) {
    throw new RangeError(
      `AAL policy.thresholds.block must be in [0, 1], got ${block}`
    )
  }
  if (warn >= block) {
    throw new RangeError(
      `AAL policy.thresholds must satisfy warn < block (got warn=${warn}, block=${block})`
    )
  }
}
