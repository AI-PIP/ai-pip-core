/**
 * Types for ISL (Instruction Sanitization Layer) - Semantic Core
 */

// Import types from CSL and value objects
import type { LineageEntry, TrustLevel } from '../csl/value-objects/index.js'
import type { PiDetectionResult } from './value-objects/PiDetectionResult.js'
import type { ThreatTag } from './tags/threat-tag.js' 

// Re-export RiskScore for convenience
export type { RiskScore } from './value-objects/RiskScore.js'









/**
 * ISLSegment - Segment sanitized by ISL
 */
export interface ISLSegment {
  readonly id: string
  readonly originalContent: string        // Original content from CSL
  readonly sanitizedContent: string        // Sanitized content
  readonly trust: TrustLevel               // Trust level of the original segment
  readonly lineage: LineageEntry[]         // Lineage updated with ISL
  readonly piDetection?: PiDetectionResult  // Prompt injection detection
  readonly sanitizationLevel: 'minimal' | 'moderate' | 'aggressive'
}

/**
 * ISLResult - Sanitization result
 * 
 * @remarks
 * The ISLResult contains the following:
 *  - segments: readonly ISLSegment[]
 *  - lineage: readonly LineageEntry[]
 *  - threatTags: readonly ThreatTag[]
 *  - metadata: {
 *      - totalSegments: number
 *      - sanitizedSegments: number
 *      - processingTimeMs?: number 
 *  }
 */
export interface ISLResult {
  readonly segments: readonly ISLSegment[]
  readonly lineage: readonly LineageEntry[]
  readonly threatTags: readonly ThreatTag[]
  readonly metadata: {
    readonly totalSegments: number
    readonly sanitizedSegments: number
    readonly processingTimeMs?: number
  }
}

