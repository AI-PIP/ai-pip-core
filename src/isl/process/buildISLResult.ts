/**
 * buildISLResult - Builds the internal ISL result
 * 
 * @remarks
 * This function builds the internal ISLResult that contains
 * all ISL processing information.
 * 
 * **Responsibility:**
 * - Build ISLResult from processed segments
 * - Add processing metadata
 * - Preserve complete lineage
 */

import type { ISLResult, ISLSegment } from '../types.js'
import type { LineageEntry } from '../../csl/value-objects/index.js'

/**
 * Builds an ISLResult from processed segments
 * 
 * @param segments - Segments sanitized by ISL
 * @param lineage - Complete processing lineage
 * @param processingTimeMs - Processing time in milliseconds (optional)
 * @returns ISLResult with all processing information
 */
export function buildISLResult(
  segments: readonly ISLSegment[],
  lineage: readonly LineageEntry[],
  processingTimeMs?: number
): ISLResult {
  const metadata = processingTimeMs === undefined
    ? {
        totalSegments: segments.length,
        sanitizedSegments: segments.length
      }
    : {
        totalSegments: segments.length,
        sanitizedSegments: segments.length,
        processingTimeMs
      }

  return {
    segments: Object.freeze(segments),
    lineage: Object.freeze(lineage),
    metadata: Object.freeze(metadata)
  }
}
