/**
 * Threat tag types – Aligned with ISL detection taxonomy.
 *
 * @remarks
 * Tag types correspond to pattern_type in PiDetection. Used for canonical
 * encapsulation: <aipip:threat-type>...</aipip>. Single source of truth: detect layer.
 */

export { THREAT_TYPES } from '../detect/detect.js'
export type { ThreatType } from '../detect/detect.js'

/** Alias for tag context (same as ThreatType) */
export type ThreatTagType = import('../detect/detect.js').ThreatType
