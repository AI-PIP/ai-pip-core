/**
 * buildRemediationPlan - Builds a remediation plan (what to do, not how).
 *
 * @remarks
 * AAL describes *what* to do: strategy, goals, constraints, and which segments
 * are affected. The SDK (or an AI agent) is responsible for *how* to perform
 * cleanup (e.g. using an AI tool to remove malicious instructions without
 * affecting legitimate content).
 */

import type { RemediationPlan } from '../types.js'
import type { AgentPolicy } from '../types.js'
import type { ISLResult } from '../../isl/types.js'
import type { PiDetection } from '../../isl/value-objects/PiDetection.js'
import { validateAgentPolicyThresholds } from './validatePolicy.js'

const STRATEGY_AI_CLEANUP = 'AI_CLEANUP'

const DEFAULT_CONSTRAINTS = Object.freeze([
  'preserve_user_intent',
  'do_not_add_information',
  'do_not_change_language'
] as const)

/** Maps ISL pattern_type to remediation goal (e.g. prompt-injection -> remove_prompt_injection). */
function patternTypeToGoal(type: string): string {
  const normalized = type.replaceAll('-', '_').toLowerCase()
  return `remove_${normalized}`
}

const EMPTY_PLAN: RemediationPlan = Object.freeze({
  strategy: STRATEGY_AI_CLEANUP,
  goals: Object.freeze([]),
  constraints: DEFAULT_CONSTRAINTS,
  targetSegments: Object.freeze([]),
  needsRemediation: false
})

function assertBuildRemediationPlanArgs(islResult: ISLResult, policy: AgentPolicy): void {
  if (islResult == null || typeof islResult !== 'object') {
    throw new TypeError('AAL buildRemediationPlan: islResult must be a non-null object')
  }
  if (!Array.isArray(islResult.segments)) {
    throw new TypeError('AAL buildRemediationPlan: islResult.segments must be an array')
  }
  if (policy == null || typeof policy !== 'object') {
    throw new TypeError('AAL buildRemediationPlan: policy must be a non-null object')
  }
  const r = policy.remediation
  if (r == null || typeof r !== 'object' || typeof r.enabled !== 'boolean') {
    throw new TypeError('AAL buildRemediationPlan: policy.remediation.enabled must be a boolean')
  }
  validateAgentPolicyThresholds(policy)
}

/**
 * Builds a remediation plan from the ISL result and policy.
 * Target segments are those with at least one detection; goals are derived from detection types.
 *
 * @param islResult - ISL result with segments and per-segment piDetection
 * @param policy - Agent policy (remediation.enabled)
 * @returns RemediationPlan for the SDK / AI agent to execute
 */
export function buildRemediationPlan(
  islResult: ISLResult,
  policy: AgentPolicy
): RemediationPlan {
  assertBuildRemediationPlanArgs(islResult, policy)

  if (!policy.remediation.enabled) {
    return EMPTY_PLAN
  }

  const targetSegments: string[] = []
  const goalsSet = new Set<string>()

  for (const segment of islResult.segments) {
    const detections = segment.piDetection?.detections
    if (!Array.isArray(detections) || detections.length === 0) continue
    targetSegments.push(segment.id)
    for (const d of detections as readonly PiDetection[]) {
      const type: string = d.pattern_type ?? 'unknown'
      goalsSet.add(patternTypeToGoal(type))
    }
  }

  if (targetSegments.length === 0) {
    return EMPTY_PLAN
  }

  return Object.freeze({
    strategy: STRATEGY_AI_CLEANUP,
    goals: Object.freeze([...goalsSet].sort((a, b) => a.localeCompare(b))),
    constraints: DEFAULT_CONSTRAINTS,
    targetSegments: Object.freeze(targetSegments),
    needsRemediation: true
  })
}
