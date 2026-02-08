import type { RiskScore } from '../isl/value-objects/RiskScore.js'

/**
 * AnomalyAction
 *
 * Represents the high-level action an agent should take
 * after evaluating security signals.
 *
 * @remarks
 * This is a semantic decision only.
 * Execution of the action is handled by the SDK.
 */
export type AnomalyAction = 'ALLOW' | 'WARN' | 'BLOCK'

/**
 * BlockedIntent
 *
 * Represents an intent that is explicitly blocked by policy.
 * Used for semantic classification and auditing purposes.
 */
export type BlockedIntent = string

/**
 * SensitiveScope
 *
 * Represents a sensitive topic or domain that requires
 * additional validation or stricter policy evaluation.
 */
export type SensitiveScope = string

/**
 * ProtectedRole
 *
 * Represents a role that must not be overridden or impersonated
 * by user-provided instructions.
 */
export type ProtectedRole = string

/**
 * ImmutableInstruction
 *
 * Represents an instruction that must not be altered,
 * removed, or overridden under any circumstance.
 */
export type ImmutableInstruction = string

/**
 * RemediationPlan
 *
 * Describes *what* to do for remediation, not *how*. The SDK (or an AI agent) is
 * responsible for executing cleanup. AAL produces goals, constraints, and
 * target segment IDs so the consumer can run AI_CLEANUP or another strategy.
 */
export interface RemediationPlan {
  /** Strategy identifier for the consumer (e.g. 'AI_CLEANUP'). */
  readonly strategy: string
  /** Goals to achieve (e.g. remove_prompt_injection, remove_role_hijacking). */
  readonly goals: readonly string[]
  /** Constraints the remediation must respect (e.g. preserve_user_intent). */
  readonly constraints: readonly string[]
  /** Segment IDs that need remediation (segments with detections). */
  readonly targetSegments: readonly string[]
  /** Whether remediation is needed (has threats and remediation enabled). */
  readonly needsRemediation: boolean
}

/**
 * AgentPolicy
 *
 * Defines how an agent should react to risk signals
 * emitted by the Instruction Sanitization Layer (ISL).
 *
 * @remarks
 * - This is a pure configuration object.
 * - It contains no logic and produces no side effects.
 * - Policies are interpreted by AAL and executed by the SDK.
 *
 * AgentPolicy describes *intent*, not implementation.
 */

export interface AgentPolicy {

  /**
   * Risk thresholds that drives desicion making.
   */
  thresholds: {
    warn: RiskScore,
    block: RiskScore,
  },

   /**
   * Whether to produce a remediation plan when threats are present.
   * The SDK (or AI agent) performs the actual cleanup using the plan.
   */
  remediation: {
    enabled: boolean;
  },
  

  mode?: 'strict' | 'balanced' | 'permissive',
  explain?: boolean,


}