import type { CSLResult } from '../csl/types.js'
import type { TrustLevel } from '../csl/value-objects/index.js'
import { TrustLevelType } from '../csl/types.js'
import type { ISLResult, ISLSegment } from './types.js'
import { buildISLLineage } from './lineage/buildISLLineage.js'
import { buildISLResult } from './process/buildISLResult.js'

/**
 * Sanitizes content according to trust level - pure function
 * 
 * @remarks
 * ISL applies differentiated sanitization according to trust level:
 * - TC: Minimal sanitization
 * - STC: Moderate sanitization
 * - UC: Aggressive sanitization
 */
export function sanitize(cslResult: CSLResult): ISLResult {
  const startTime = Date.now()
  const segments: ISLSegment[] = []
  

  for (const cslSegment of cslResult.segments) {
    // Determine sanitization level according to trust level
    const sanitizationLevel = getSanitizationLevel(cslSegment.trust)

    // Sanitize content according to level
    const sanitized = sanitizeContent(
      cslSegment.content,
      sanitizationLevel
    )

    // Build ISL lineage for this segment
    const segmentLineage = buildISLLineage(cslSegment.lineage, startTime)

    // Create sanitized segment
    const islSegment: ISLSegment = {
      id: cslSegment.id,
      originalContent: cslSegment.content,  // ✅ Preserve original
      sanitizedContent: sanitized.content,
      trust: cslSegment.trust,
      lineage: [...segmentLineage], // Convert readonly to mutable for segment
      sanitizationLevel
    }

    segments.push(islSegment)
  }

  // Build complete lineage
  const allLineage = buildISLLineage(cslResult.lineage, startTime)

  // Build result using process function
  const processingTime = Date.now() - startTime
  return buildISLResult(segments, allLineage, processingTime)
}

/**
 * Determines sanitization level according to trust level - pure function
 */
function getSanitizationLevel(trust: TrustLevel): 'minimal' | 'moderate' | 'aggressive' {
  if (trust.value === TrustLevelType.TC) return 'minimal'
  if (trust.value === TrustLevelType.STC) return 'moderate'
  return 'aggressive'  // UC
}

/**
 * Sanitizes content according to level - pure function
 */
function sanitizeContent(
  content: string,
  _level: 'minimal' | 'moderate' | 'aggressive'
): { content: string; } {
  // For now returns content unchanged
  // Real sanitization logic will be implemented later
  return {
    content,
  }
}

