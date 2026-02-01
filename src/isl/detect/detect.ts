/**
 * ISL threat detection - pure, deterministic, single source of truth.
 *
 * Runs pattern-based detection on content and returns PiDetection[].
 * No duplication: reuses Pattern, findAllMatches, createPiDetection.
 * Same input → same output; bounded by MAX_TOTAL_DETECTIONS and per-pattern cap.
 */

import type { Pattern } from '../value-objects/Pattern.js'
import type { PiDetection } from '../value-objects/PiDetection.js'
import {
  MAX_MATCHES,
  createPattern,
  createPiDetection,
  findAllMatches
} from '../value-objects/index.js'

/** Threat pattern type identifiers (deterministic taxonomy) */
export const THREAT_TYPES = {
  PROMPT_INJECTION: 'prompt-injection',
  JAILBREAK: 'jailbreak',
  ROLE_HIJACKING: 'role_hijacking',
  SCRIPT_LIKE: 'script_like',
  HIDDEN_TEXT: 'hidden_text'
} as const

export type ThreatType = (typeof THREAT_TYPES)[keyof typeof THREAT_TYPES]

/** Max detections per pattern per segment (avoids one pattern flooding) */
const MAX_PER_PATTERN = 200
/** Max total detections per segment */
const MAX_TOTAL_DETECTIONS = 2000

/** Builds the default threat patterns (created once, frozen). Deterministic regexes only. */
function buildDefaultThreatPatterns(): readonly Pattern[] {
  const patterns: Pattern[] = [
    createPattern(
      THREAT_TYPES.PROMPT_INJECTION,
      /ignore\s+previous\s+instructions/gi,
      0.9,
      'Ignore previous instructions phrase'
    ),
    createPattern(
      THREAT_TYPES.PROMPT_INJECTION,
      /disregard\s+(?:all\s+)?(?:above|previous)\s+(?:instructions?|prompts?)/gi,
      0.85,
      'Disregard above/previous instructions'
    ),
    createPattern(
      THREAT_TYPES.JAILBREAK,
      /jailbreak/gi,
      0.8,
      'Jailbreak keyword'
    ),
    createPattern(
      THREAT_TYPES.JAILBREAK,
      /ignore\s+all\s+previous\s+instructions/gi,
      0.9,
      'Ignore all previous instructions'
    ),
    createPattern(
      THREAT_TYPES.ROLE_HIJACKING,
      /(?:you\s+are\s+now|act\s+as|pretend\s+to\s+be)\s+[a-z]/gi,
      0.75,
      'Role override: you are now / act as'
    ),
    createPattern(
      THREAT_TYPES.ROLE_HIJACKING,
      /from\s+now\s+on\s+you\s+are/gi,
      0.8,
      'From now on you are'
    ),
    createPattern(
      THREAT_TYPES.SCRIPT_LIKE,
      /<script\b/gi,
      0.85,
      'Script tag start'
    ),
    createPattern(
      THREAT_TYPES.SCRIPT_LIKE,
      /javascript\s*:/gi,
      0.8,
      'javascript: URI'
    ),
    createPattern(
      THREAT_TYPES.HIDDEN_TEXT,
      /display\s*:\s*none/gi,
      0.7,
      'CSS display:none (hidden content)'
    ),
    createPattern(
      THREAT_TYPES.HIDDEN_TEXT,
      /visibility\s*:\s*hidden/gi,
      0.7,
      'CSS visibility:hidden'
    ),
    createPattern(
      THREAT_TYPES.HIDDEN_TEXT,
      /(?:font-size|opacity)\s*:\s*0\s*;?/gi,
      0.6,
      'CSS zero font-size or opacity (hidden text)'
    )
  ]
  return Object.freeze(patterns)
}

let cachedPatterns: readonly Pattern[] | null = null

/** Returns default threat patterns (cached, frozen). */
export function getDefaultThreatPatterns(): readonly Pattern[] {
  cachedPatterns ??= buildDefaultThreatPatterns()
  return cachedPatterns
}

export interface DetectThreatsOptions {
  /** Max total detections to return (default: MAX_TOTAL_DETECTIONS) */
  maxTotal?: number
  /** Max matches per pattern (default: MAX_PER_PATTERN) */
  maxPerPattern?: number
  /** Override patterns (default: getDefaultThreatPatterns()) */
  patterns?: readonly Pattern[]
}

/**
 * Detects threats in content using the configured patterns.
 * Pure, deterministic: same content → same PiDetection[] (order preserved by pattern order then by match position).
 * Bounded by maxTotal and maxPerPattern to avoid runaway.
 *
 * @param content - Segment or string to scan
 * @param options - Optional caps and pattern override
 * @returns Array of PiDetection (frozen); empty if none
 */
export function detectThreats(
  content: string,
  options: DetectThreatsOptions = {}
): readonly PiDetection[] {
  const maxTotal = Math.min(
    options.maxTotal ?? MAX_TOTAL_DETECTIONS,
    MAX_MATCHES
  )
  const maxPerPattern = options.maxPerPattern ?? MAX_PER_PATTERN
  const patterns = options.patterns ?? getDefaultThreatPatterns()

  if (typeof content !== 'string') {
    throw new TypeError('detectThreats: content must be a string')
  }
  if (content.length === 0) {
    return Object.freeze([])
  }
  if (maxTotal <= 0 || patterns.length === 0) {
    return Object.freeze([]) as readonly PiDetection[]
  }

  const detections: PiDetection[] = []
  for (const pattern of patterns) {
    if (detections.length >= maxTotal) break
    const remaining = maxTotal - detections.length
    const cap = Math.min(maxPerPattern, remaining)
    const matches = findAllMatches(pattern, content, cap)
    for (const m of matches) {
      if (m.matched.length === 0) continue
      detections.push(
        createPiDetection(
          pattern.pattern_type,
          m.matched,
          m.position,
          pattern.base_confidence
        )
      )
      if (detections.length >= maxTotal) break
    }
  }
  return Object.freeze(detections)
}
