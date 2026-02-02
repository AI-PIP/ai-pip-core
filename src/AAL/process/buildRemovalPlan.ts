/**
 * buildRemovalPlan - Builds a plan for instruction removal
 *
 * @remarks
 * Two entry points:
 * - buildRemovalPlan(islSignal, policy): from signal only; no segmentId (descriptive).
 * - buildRemovalPlanFromResult(islResult, policy): from result; includes segmentId for applyRemovalPlan.
 */

import type { RemovedInstruction } from '../types.js'
import type { AgentPolicy } from '../types.js'
import type { ISLSignal } from '../../isl/signals.js'
import type { ISLResult } from '../../isl/types.js'
import type { PiDetection } from '../../isl/value-objects/PiDetection.js'

/**
 * Plan for instruction removal
 */
export interface RemovalPlan {
  readonly instructionsToRemove: readonly RemovedInstruction[]
  readonly shouldRemove: boolean
  readonly removalEnabled: boolean
}

function mapDetectionToRemovedInstruction(
  detection: PiDetection,
  segmentId?: string
): RemovedInstruction {
  return {
    type: detection.pattern_type,
    pattern: detection.matched_pattern,
    position: detection.position,
    description: `Detected ${detection.pattern_type} pattern with confidence ${detection.confidence.toFixed(3)}`,
    ...(segmentId != null && { segmentId })
  }
}

const EMPTY_PLAN_DISABLED: RemovalPlan = Object.freeze({
  instructionsToRemove: Object.freeze([]),
  shouldRemove: false,
  removalEnabled: false
})
const EMPTY_PLAN_NO_THREATS: RemovalPlan = Object.freeze({
  instructionsToRemove: Object.freeze([]),
  shouldRemove: false,
  removalEnabled: true
})

function assertPolicyForRemoval(policy: AgentPolicy): void {
  if (policy == null || typeof policy !== 'object') {
    throw new TypeError('AAL buildRemovalPlan: policy must be a non-null object')
  }
  const r = policy.removal
  if (r == null || typeof r !== 'object' || typeof r.enabled !== 'boolean') {
    throw new TypeError('AAL buildRemovalPlan: policy.removal.enabled must be a boolean')
  }
}

function assertISLSignalForRemoval(signal: ISLSignal): void {
  if (signal == null || typeof signal !== 'object') {
    throw new TypeError('AAL buildRemovalPlan: islSignal must be a non-null object')
  }
}

/**
 * Builds a plan for instruction removal from ISL signal (no segment ids).
 * Use when you only have the signal; plan is descriptive. For actionable removal use buildRemovalPlanFromResult.
 *
 * @param islSignal - ISL signal with detections
 * @param policy - Agent policy
 * @returns RemovalPlan with instructions to remove (no segmentId)
 */
export function buildRemovalPlan(
  islSignal: ISLSignal,
  policy: AgentPolicy
): RemovalPlan {
  assertPolicyForRemoval(policy)
  assertISLSignalForRemoval(islSignal)

  if (!policy.removal.enabled) return EMPTY_PLAN_DISABLED
  if (!islSignal.hasThreats) return EMPTY_PLAN_NO_THREATS

  const detections: readonly PiDetection[] | undefined = islSignal.piDetection?.detections
  if (!Array.isArray(detections) || detections.length === 0) {
    return EMPTY_PLAN_NO_THREATS
  }

  const instructionsToRemove: RemovedInstruction[] = detections.map(
    (d: PiDetection) => mapDetectionToRemovedInstruction(d)
  )
  return {
    instructionsToRemove: Object.freeze(instructionsToRemove),
    shouldRemove: instructionsToRemove.length > 0,
    removalEnabled: true
  }
}

function assertISLResultForRemoval(islResult: ISLResult): void {
  if (islResult == null || typeof islResult !== 'object') {
    throw new TypeError('AAL buildRemovalPlanFromResult: islResult must be a non-null object')
  }
  if (!Array.isArray(islResult.segments)) {
    throw new TypeError('AAL buildRemovalPlanFromResult: islResult.segments must be an array')
  }
}

/**
 * Builds a plan for instruction removal from ISL result (with segment ids).
 * Use with applyRemovalPlan to produce content with malicious ranges removed.
 *
 * @param islResult - ISL result with segments and per-segment piDetection
 * @param policy - Agent policy
 * @returns RemovalPlan with instructions to remove (segmentId set per instruction)
 */
export function buildRemovalPlanFromResult(
  islResult: ISLResult,
  policy: AgentPolicy
): RemovalPlan {
  assertPolicyForRemoval(policy)
  assertISLResultForRemoval(islResult)

  if (!policy.removal.enabled) return EMPTY_PLAN_DISABLED

  const instructionsToRemove: RemovedInstruction[] = []
  for (const segment of islResult.segments) {
    const detections: readonly PiDetection[] | undefined = segment.piDetection?.detections
    if (!Array.isArray(detections) || detections.length === 0) continue
    for (const d of detections as PiDetection[]) {
      instructionsToRemove.push(mapDetectionToRemovedInstruction(d, segment.id))
    }
  }
  return {
    instructionsToRemove: Object.freeze(instructionsToRemove),
    shouldRemove: instructionsToRemove.length > 0,
    removalEnabled: true
  }
}
