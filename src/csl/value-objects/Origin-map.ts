import { OriginType, TrustLevelType } from '../types'

/**
 * originMap is the deterministic mapping from OriginType to TrustLevelType.
 * 
 * @remarks
 * This map defines the **deterministic classification rules** for content segments.
 * The mapping is based solely on the origin type, not on content analysis.
 * 
 * **Key Principles:**
 * - 100% deterministic: same origin → same trust level, always
 * - No heuristics or content analysis
 * - All OriginType values must be present in this map
 */
export const originMap = new Map<OriginType, TrustLevelType>([
  // User origins - always untrusted (security by default)
  [OriginType.USER, TrustLevelType.UC],
  
  // DOM origins - trust based on visibility
  [OriginType.DOM_VISIBLE, TrustLevelType.STC],
  [OriginType.DOM_HIDDEN, TrustLevelType.UC],
  [OriginType.DOM_ATTRIBUTE, TrustLevelType.STC],
  
  // External origins - always untrusted
  [OriginType.SCRIPT_INJECTED, TrustLevelType.UC],
  [OriginType.NETWORK_FETCHED, TrustLevelType.UC],
  
  // System origins - trusted (system controls)
  [OriginType.SYSTEM_GENERATED, TrustLevelType.TC],
  
  // Unknown - untrusted by default (fail-secure)
  [OriginType.UNKNOWN, TrustLevelType.UC],
])

/**
 * Validates that all OriginType values are mapped in originMap.
 * 
 * @throws {Error} If any OriginType is not present in originMap
 */
export function validateOriginMap(): void {
  const allOriginTypes = Object.values(OriginType)
  const missingTypes = allOriginTypes.filter(type => !originMap.has(type))
  
  if (missingTypes.length > 0) {
    throw new Error(
      `Missing origin mappings: ${missingTypes.join(', ')}. ` +
      `All OriginType values must be mapped in originMap.`
    )
  }
}

