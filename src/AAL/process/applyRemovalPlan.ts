/**
 * applyRemovalPlan - Applies a removal plan to ISL result (pure, deterministic).
 *
 * @remarks
 * Removes malicious ranges from each segment's sanitizedContent according to the plan.
 * Only instructions with segmentId are applied; others are skipped.
 * Overlapping ranges per segment are merged before removal.
 */

import type { Position } from '../../shared/types.js'
import type { RemovalPlan } from './buildRemovalPlan.js'
import type { ISLResult, ISLSegment } from '../../isl/types.js'

/**
 * Clamps position ranges to valid [0, contentLength) and drops empty or invalid ranges.
 * Ensures 0 <= start <= end <= contentLength and start < end.
 */
function clampRangesToContent(
  ranges: readonly Position[],
  contentLength: number
): Position[] {
  if (contentLength <= 0 || ranges.length === 0) return []
  const result: Position[] = []
  for (const r of ranges) {
    const start = Math.max(0, Math.min(Number(r.start), contentLength))
    const end = Math.max(0, Math.min(Number(r.end), contentLength))
    if (start < end) result.push({ start, end })
  }
  return result
}

/**
 * Merges overlapping ranges (start inclusive, end exclusive). Sorted by start.
 */
function mergeRanges(ranges: readonly Position[]): Position[] {
  if (ranges.length === 0) return []
  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged: Position[] = [{ start: sorted[0]!.start, end: sorted[0]!.end }]
  for (let i = 1; i < sorted.length; i++) {
    const r = sorted[i]!
    const last = merged.at(-1)!
    if (r.start <= last.end) {
      merged[merged.length - 1] = { start: last.start, end: Math.max(last.end, r.end) }
    } else {
      merged.push({ start: r.start, end: r.end })
    }
  }
  return merged
}

/** Max gap (chars) between ranges to consider for merging when gap is only punctuation/whitespace */
const MAX_PUNCTUATION_GAP = 10

/** True if the substring is only whitespace and/or common punctuation (no words). */
function isOnlyPunctuationOrWhitespace(s: string): boolean {
  return /^[\s.,;:!?'"-]*$/.test(s)
}

/**
 * Merges consecutive ranges when the gap between them is only punctuation/whitespace,
 * so we remove one contiguous block instead of leaving fragments like ", . ".
 */
function mergeAdjacentByPunctuation(
  ranges: readonly Position[],
  content: string
): Position[] {
  if (ranges.length <= 1) return [...ranges]
  const result: Position[] = [{ ...ranges[0]! }]
  for (let i = 1; i < ranges.length; i++) {
    const r = ranges[i]!
    const last = result.at(-1)!
    const gapStart = last.end
    const gapEnd = r.start
    if (gapEnd > gapStart && gapEnd - gapStart <= MAX_PUNCTUATION_GAP) {
      const gap = content.slice(gapStart, gapEnd)
      if (isOnlyPunctuationOrWhitespace(gap)) {
        result[result.length - 1] = { start: last.start, end: r.end }
        continue
      }
    }
    result.push({ ...r })
  }
  return result
}

/**
 * Removes given ranges from content. Ranges must be non-overlapping and sorted by start.
 */
function removeRanges(content: string, ranges: readonly Position[]): string {
  if (ranges.length === 0) return content
  let result = ''
  let pos = 0
  for (const r of ranges) {
    if (r.start > pos) result += content.slice(pos, r.start)
    pos = Math.max(pos, r.end)
  }
  if (pos < content.length) result += content.slice(pos)
  return result
}

function assertApplyRemovalPlanArgs(islResult: ISLResult, plan: RemovalPlan): void {
  if (islResult == null || typeof islResult !== 'object') {
    throw new TypeError('AAL applyRemovalPlan: islResult must be a non-null object')
  }
  if (!Array.isArray(islResult.segments)) {
    throw new TypeError('AAL applyRemovalPlan: islResult.segments must be an array')
  }
  if (plan == null || typeof plan !== 'object') {
    throw new TypeError('AAL applyRemovalPlan: plan must be a non-null object')
  }
  if (!Array.isArray(plan.instructionsToRemove)) {
    throw new TypeError('AAL applyRemovalPlan: plan.instructionsToRemove must be an array')
  }
}

/**
 * Applies a removal plan to an ISL result.
 * Produces a new ISLResult with segment sanitizedContent updated (malicious ranges removed).
 * Instructions without segmentId are ignored. Positions are clamped to [0, content.length] per segment; invalid or empty ranges are dropped. Lineage and metadata are preserved.
 *
 * @param islResult - ISL result (segments with sanitizedContent and optional piDetection)
 * @param plan - Removal plan from buildRemovalPlanFromResult (must include segmentIds for removal)
 * @returns New ISLResult with sanitizedContent updated per segment
 */
export function applyRemovalPlan(islResult: ISLResult, plan: RemovalPlan): ISLResult {
  assertApplyRemovalPlanArgs(islResult, plan)

  if (!plan.shouldRemove || plan.instructionsToRemove.length === 0) {
    return islResult
  }

  const bySegmentId = new Map<string, Position[]>()
  for (const inst of plan.instructionsToRemove) {
    if (inst.segmentId == null) continue
    const list = bySegmentId.get(inst.segmentId) ?? []
    list.push(inst.position)
    bySegmentId.set(inst.segmentId, list)
  }

  if (bySegmentId.size === 0) return islResult

  const newSegments: ISLSegment[] = islResult.segments.map((seg) => {
    const ranges = bySegmentId.get(seg.id)
    if (ranges == null || ranges.length === 0) return seg
    const content = seg.sanitizedContent ?? ''
    const len = typeof content === 'string' ? content.length : 0
    const clamped = clampRangesToContent(ranges, len)
    if (clamped.length === 0) return seg
    const merged = mergeRanges(clamped)
    const mergedAdjacent = mergeAdjacentByPunctuation(merged, content)
    const newContent = removeRanges(content, mergedAdjacent)
    return { ...seg, sanitizedContent: newContent }
  })

  return {
    segments: Object.freeze(newSegments),
    lineage: islResult.lineage,
    metadata: islResult.metadata
  }
}
