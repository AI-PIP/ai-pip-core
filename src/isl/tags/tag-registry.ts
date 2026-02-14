/**
 * Tag registry – Valid threat tag types for validation and iteration.
 *
 * @remarks
 * Single source of truth is ISL detect (THREAT_TYPES). This module exposes
 * a readonly list and a type guard for use by ThreatTag creation and by the SDK.
 */

import { THREAT_TYPES } from './threat-tag-type.js'
import type { ThreatTagType } from './threat-tag-type.js'

/** Readonly list of valid tag type strings (for validation and iteration) */
export const VALID_TAG_TYPES: readonly ThreatTagType[] = Object.values(
  THREAT_TYPES
) as ThreatTagType[]

/**
 * Type guard: returns true if value is a valid ThreatTagType.
 */
export function isValidThreatTagType(value: string): value is ThreatTagType {
  return (VALID_TAG_TYPES as readonly string[]).includes(value)
}
