import type { RiskScore } from '../isl/value-objects/RiskScore.js'
import type { Position } from "../shared/types.js"


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
 * RemovedInstruction
 *
 * Describes an instruction that was identified as malicious
 * and marked for removal by the Agent Action Lock (AAL).
 *
 * @remarks
 * This interface is descriptive only.
 * The actual removal is performed by the SDK.
 *
 * Instances of this type are typically recorded in lineage
 * for auditability and explainability.
 */
export interface RemovedInstruction {
  /**
   * The classified threat category that triggered the removal.
   */
  readonly type:
    | 'system_command'
    | 'role_swapping'
    | 'jailbreak'
    | 'override'
    | 'manipulation'

  /**
   * The detected pattern or signature that matched the threat.
   */
  readonly pattern: string

  /**
   * The exact position of the instruction within the original content.
   */
  readonly position: Position

  /**
   * Human-readable explanation of why the instruction was removed.
   */
  readonly description: string
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
   * Whether malicious instructions should be removed
   * before reaching the LLM.
   */
  removal: {
    enabled: boolean;
  },
  

  mode?: 'strict' | 'balanced' | 'permissive',
  explain?: boolean,


}