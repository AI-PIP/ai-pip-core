/**
 * AAL (Agent Action Lock) - Semantic Core
 * 
 * @remarks
 * This is the semantic core of AAL. It only contains:
 * - Pure functions (stateless)
 * - Immutable value objects
 * - Types
 * - Decision processing
 * 
 * **Architecture:**
 * - Consumes ISLSignal (not ISLResult) to maintain layer separation
 * - Applies configurable policies (ALLOW/WARN/BLOCK)
 * - Builds remediation plans (what to do, not how; SDK/AI agent performs cleanup)
 * - Does not execute actions (that is SDK responsibility)
 * 
 * **Does NOT contain:**
 * - Prompt injection detection (goes to ISL)
 * - Stateful services (go to SDK)
 * - Action execution (goes to SDK)
 */

// Value objects
export {
    createAnomalyScore,
    isHighRisk,
    isLowRisk,
    isWarnRisk,
    isRoleProtected,
    isContextLeakPreventionEnabled,
    isInstructionImmutable,
    isIntentBlocked,
    isScopeSensitive
} from './value-objects/index.js'

export type {
    AnomalyScore,
    PolicyRule
} from './value-objects/index.js'

// Process functions
export {
    resolveAgentAction,
    resolveAgentActionWithScore,
    buildDecisionReason,
    buildRemediationPlan
} from './process/index.js'

export type { DecisionReason } from './process/index.js'

// Lineage
export { buildAALLineage } from './lineage/index.js'

// Display constants (for SDK/UI)
export { ACTION_DISPLAY_COLORS, getActionDisplayColor } from './constants.js'

// Types
export type {
    AnomalyAction,
    RemediationPlan,
    BlockedIntent,
    SensitiveScope,
    ProtectedRole,
    ImmutableInstruction,
    AgentPolicy,
} from './types.js'