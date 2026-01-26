

/**
 * Represents a zero-based position range within a string or segment.
 *
 * @remarks
 * - `start` is inclusive
 * - `end` is exclusive
 * - Must satisfy: 0 <= start <= end
 *
 * This type is purely structural and shared across layers
 * (CSL, ISL, AAL, reporters).
 */
export type Position = {
    /** Inclusive start index */
    readonly start: number
  
    /** Exclusive end index */
    readonly end: number
  }
  
  /**
   * References a specific segment and an optional position within it.
   *
   * @remarks
   * Used to precisely point to a sub-range of a segment without
   * mutating or interpreting its content.
   *
   * Common use cases:
   * - ISL: attach threat signals to exact locations
   * - AAL: target removals or locks precisely
   * - Reporting: highlight affected content
   */
  export type SegmentRef = {
    /** Unique identifier of the segment */
    readonly segmentId: string
  
    /** Optional position within the segment */
    readonly position?: Position
  }
  