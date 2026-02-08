import type { CSLResult } from '../csl/types.js'
import type { TrustLevel } from '../csl/value-objects/index.js'
import { TrustLevelType } from '../csl/types.js'
import type { ISLResult, ISLSegment } from './types.js'
import { buildISLLineage } from './lineage/buildISLLineage.js'
import { buildISLResult } from './process/buildISLResult.js'
import { detectThreats } from './detect/index.js'
import type { DetectThreatsOptions } from './detect/index.js'
import { createPiDetectionResult } from './value-objects/PiDetectionResult.js'

/** Options for sanitize. Enables flexible threat detection (e.g. custom patterns). */
export interface SanitizeOptions {
  /** Passed to detectThreats per segment (e.g. patterns override/extend). */
  readonly detectThreatsOptions?: DetectThreatsOptions
}

/**
 * Sanitizes content according to trust level - pure function
 *
 * @remarks
 * ISL applies differentiated sanitization according to trust level:
 * - TC: Minimal sanitization
 * - STC: Moderate sanitization
 * - UC: Aggressive sanitization
 * Threat detection uses default patterns unless detectThreatsOptions (e.g. patterns) is provided.
 */
export function sanitize(cslResult: CSLResult, options: SanitizeOptions = {}): ISLResult {
  const startTime = Date.now()
  const segments: ISLSegment[] = []
  const detectOptions = options.detectThreatsOptions

  for (const cslSegment of cslResult.segments) {
    // Determine sanitization level according to trust level
    const sanitizationLevel = getSanitizationLevel(cslSegment.trust)

    // Sanitize content according to level
    const sanitized = sanitizeContent(
      cslSegment.content,
      sanitizationLevel
    )

    // Detect threats on sanitizedContent; positions are segment-local for downstream use (e.g. SDK/AI remediation).
    const detections = detectThreats(sanitized.content, detectOptions)
    const piDetection =
      detections.length > 0 ? createPiDetectionResult(detections) : undefined

    // Build ISL lineage for this segment
    const segmentLineage = buildISLLineage(cslSegment.lineage, startTime)

    // Create sanitized segment with detections when present
    const islSegment: ISLSegment = {
      id: cslSegment.id,
      originalContent: cslSegment.content,
      sanitizedContent: sanitized.content,
      trust: cslSegment.trust,
      lineage: [...segmentLineage],
      sanitizationLevel,
      ...(piDetection !== undefined && { piDetection })
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

