import type { BlockedIntent, ImmutableInstruction, ProtectedRole, SensitiveScope } from '../types'

/**
 * RoleProtectionConfig - configuración de protección de roles
 */
export type RoleProtectionConfig = {
  readonly protectedRoles: readonly ProtectedRole[]
  readonly immutableInstructions: readonly ImmutableInstruction[]
}

/**
 * ContextLeakPreventionConfig - configuración de prevención de fuga de contexto
 */
export type ContextLeakPreventionConfig = {
  readonly enabled: boolean
  readonly blockMetadataExposure: boolean
  readonly sanitizeInternalReferences: boolean
}

/**
 * PolicyRule - tipo puro
 */
export type PolicyRule = {
  readonly version: string
  readonly blockedIntents: readonly BlockedIntent[]
  readonly sensitiveScope: readonly SensitiveScope[]
  readonly roleProtection: RoleProtectionConfig
  readonly contextLeakPrevention: ContextLeakPreventionConfig
}

/**
 * Crea un PolicyRule - función pura
 */
export function createPolicyRule(
  version: string,
  blockedIntents: readonly BlockedIntent[],
  sensitiveScope: readonly SensitiveScope[],
  roleProtection: RoleProtectionConfig,
  contextLeakPrevention: ContextLeakPreventionConfig
): PolicyRule {
  if (!version || typeof version !== 'string' || version.trim().length === 0) {
    throw new Error('PolicyRule version must be a non-empty string')
  }

  if (!Array.isArray(blockedIntents)) {
    throw new TypeError('PolicyRule blockedIntents must be an array')
  }

  if (!Array.isArray(sensitiveScope)) {
    throw new TypeError('PolicyRule sensitiveScope must be an array')
  }

  if (!roleProtection || typeof roleProtection !== 'object') {
    throw new TypeError('PolicyRule roleProtection must be an object')
  }

  if (!Array.isArray(roleProtection.protectedRoles)) {
    throw new TypeError('PolicyRule roleProtection.protectedRoles must be an array')
  }

  if (!Array.isArray(roleProtection.immutableInstructions)) {
    throw new TypeError('PolicyRule roleProtection.immutableInstructions must be an array')
  }

  if (!contextLeakPrevention || typeof contextLeakPrevention !== 'object') {
    throw new TypeError('PolicyRule contextLeakPrevention must be an object')
  }

  if (typeof contextLeakPrevention.enabled !== 'boolean') {
    throw new TypeError('PolicyRule contextLeakPrevention.enabled must be a boolean')
  }

  if (typeof contextLeakPrevention.blockMetadataExposure !== 'boolean') {
    throw new TypeError('PolicyRule contextLeakPrevention.blockMetadataExposure must be a boolean')
  }

  if (typeof contextLeakPrevention.sanitizeInternalReferences !== 'boolean') {
    throw new TypeError('PolicyRule contextLeakPrevention.sanitizeInternalReferences must be a boolean')
  }

  const result: PolicyRule = {
    version: version.trim(),
    blockedIntents: Object.freeze(Array.from(blockedIntents)) as readonly BlockedIntent[],
    sensitiveScope: Object.freeze(Array.from(sensitiveScope)) as readonly SensitiveScope[],
    roleProtection: {
      protectedRoles: Object.freeze(Array.from(roleProtection.protectedRoles)) as readonly ProtectedRole[],
      immutableInstructions: Object.freeze(Array.from(roleProtection.immutableInstructions)) as readonly ImmutableInstruction[]
    },
    contextLeakPrevention: Object.freeze({ ...contextLeakPrevention })
  }
  
  return result
}

/**
 * Funciones puras para PolicyRule
 */
export function isIntentBlocked(policy: PolicyRule, intent: string): boolean {
  return policy.blockedIntents.includes(intent)
}

export function isScopeSensitive(policy: PolicyRule, scope: string): boolean {
  return policy.sensitiveScope.includes(scope)
}

export function isRoleProtected(policy: PolicyRule, role: string): boolean {
  return policy.roleProtection.protectedRoles.includes(role)
}

export function isInstructionImmutable(policy: PolicyRule, instruction: string): boolean {
  return policy.roleProtection.immutableInstructions.includes(instruction)
}

export function isContextLeakPreventionEnabled(policy: PolicyRule): boolean {
  return policy.contextLeakPrevention.enabled
}

