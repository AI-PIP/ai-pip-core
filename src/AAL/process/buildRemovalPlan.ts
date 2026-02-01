/**
 * buildRemovalPlan - Builds a plan for instruction removal
 * 
 * @remarks
 * This function builds a plan of which instructions should be removed
 * based on ISL detections and agent policy.
 * 
 * **Responsibility:**
 * - Identify instructions to remove
 * - Create removal plan based on detections
 * - Does not execute the removal (that is SDK responsibility)
 */

import type { RemovedInstruction } from '../types.js'
import type { ISLSignal } from '../../isl/signals.js'
import type { AgentPolicy } from '../types.js'

/**
 * Plan for instruction removal
 */
export interface RemovalPlan {
  readonly instructionsToRemove: readonly RemovedInstruction[]
  readonly shouldRemove: boolean
  readonly removalEnabled: boolean
}

/**
 * Builds a plan for instruction removal
 * 
 * @param islSignal - ISL signal with detections
 * @param policy - Agent policy
 * @returns RemovalPlan with instructions to remove
 */
export function buildRemovalPlan(
  islSignal: ISLSignal,
  policy: AgentPolicy
): RemovalPlan {
  // If removal is not enabled, return empty plan
  if (!policy.removal.enabled) {
    return {
      instructionsToRemove: Object.freeze([]),
      shouldRemove: false,
      removalEnabled: false
    }
  }

  // If no threats detected, nothing to remove
  if (!islSignal.hasThreats) {
    return {
      instructionsToRemove: Object.freeze([]),
      shouldRemove: false,
      removalEnabled: true
    }
  }

  // Build list of instructions to remove from detections
  const instructionsToRemove: RemovedInstruction[] = islSignal.piDetection.detections.map(
    (detection) => ({
      type: detection.pattern_type as RemovedInstruction['type'],
      pattern: detection.matched_pattern,
      position: detection.position,
      description: `Detected ${detection.pattern_type} pattern with confidence ${detection.confidence.toFixed(3)}`
    })
  )

  return {
    instructionsToRemove: Object.freeze(instructionsToRemove),
    shouldRemove: instructionsToRemove.length > 0,
    removalEnabled: true
  }
}
