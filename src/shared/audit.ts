/**
 * AI-PIP Audit utilities - Pure functions for ordered, human-readable audit output
 *
 * @remarks
 * These functions format layer results and signals into consistent, pretty-printed
 * strings or structured data for auditing, logging, and compliance. They are
 * layer-agnostic (accept minimal shapes) and do not depend on layer internals.
 */

/** Lineage entry shape used across layers */
export interface LineageEntryLike {
  readonly step: string
  readonly timestamp: number
}

/** CSL result shape for audit formatting */
export interface CSLResultLike {
  readonly segments: ReadonlyArray<{
    readonly id: string
    readonly content: string
    readonly trust: { readonly value: string }
    readonly lineage?: readonly LineageEntryLike[]
  }>
  readonly lineage: readonly LineageEntryLike[]
  readonly processingTimeMs?: number
}

/** ISL result shape for audit formatting */
export interface ISLResultLike {
  readonly segments: ReadonlyArray<{
    readonly id: string
    readonly originalContent: string
    readonly sanitizedContent: string
    readonly trust: { readonly value: string }
    readonly sanitizationLevel: string
    readonly lineage?: readonly LineageEntryLike[]
  }>
  readonly lineage: readonly LineageEntryLike[]
  readonly metadata: {
    readonly totalSegments: number
    readonly sanitizedSegments: number
    readonly processingTimeMs?: number
  }
}

/** ISL signal shape for audit formatting */
export interface ISLSignalLike {
  readonly riskScore: number
  readonly hasThreats: boolean
  readonly timestamp: number
  readonly piDetection: {
    readonly detected: boolean
    readonly score: number
    readonly detections: ReadonlyArray<unknown>
    readonly patterns?: readonly string[]
  }
}

/** AAL decision reason shape for audit formatting */
export interface DecisionReasonLike {
  readonly action: string
  readonly reason: string
  readonly riskScore: number
  readonly threshold: number
  readonly hasThreats: boolean
  readonly detectionCount: number
}

/** AAL removal plan shape for audit formatting */
export interface RemovalPlanLike {
  readonly shouldRemove: boolean
  readonly removalEnabled: boolean
  readonly instructionsToRemove: ReadonlyArray<{
    readonly type?: string
    readonly pattern?: string
    readonly description?: string
  }>
}

/** CPE result shape for audit formatting */
export interface CPEResultLike {
  readonly envelope: {
    readonly metadata: {
      readonly timestamp: number
      readonly nonce: string
      readonly protocolVersion?: string
    }
    readonly signature: {
      readonly algorithm: string
      readonly value?: string
    }
    readonly lineage: readonly LineageEntryLike[]
  }
  readonly processingTimeMs?: number
}

const SEP = '  '
const BORDER = '---'

/**
 * Formats lineage entries for pretty audit output
 *
 * @param lineage - Array of lineage entries (any layer)
 * @returns Formatted string
 */
export function formatLineageForAudit(lineage: readonly LineageEntryLike[]): string {
  if (lineage.length === 0) return 'Lineage: (none)'
  const lines = lineage.map((e, i) => `${SEP}${i + 1}. [${e.step}] ${new Date(e.timestamp).toISOString()}`)
  return ['Lineage:', ...lines].join('\n')
}

/**
 * Formats CSL result for audit - ordered and human-readable
 *
 * @param result - CSL result (or compatible shape)
 * @returns Formatted string for auditing
 */
export function formatCSLForAudit(result: CSLResultLike): string {
  const processingTimeLine =
    typeof result.processingTimeMs === 'number'
      ? [`Processing time: ${result.processingTimeMs}ms`]
      : []
  const segmentLines = result.segments.map(
    (seg, i) => `${SEP}Segment ${i + 1}: id=${seg.id} trust=${seg.trust.value} content_length=${seg.content.length}`
  )
  const lines = [
    '[CSL] Context Segmentation Layer',
    BORDER,
    `Segments: ${result.segments.length}`,
    ...processingTimeLine,
    ...segmentLines,
    '',
    formatLineageForAudit(result.lineage)
  ]
  return lines.join('\n')
}

/**
 * Formats ISL result for audit - ordered and human-readable
 *
 * @param result - ISL result (or compatible shape)
 * @returns Formatted string for auditing
 */
export function formatISLForAudit(result: ISLResultLike): string {
  const meta = result.metadata
  const processingTimeLine =
    typeof meta.processingTimeMs === 'number' ? [`Processing time: ${meta.processingTimeMs}ms`] : []
  const segmentLines = result.segments.flatMap((seg, i) => [
    `${SEP}Segment ${i + 1}: id=${seg.id} trust=${seg.trust.value} level=${seg.sanitizationLevel}`,
    `${SEP}  original_length=${seg.originalContent.length} sanitized_length=${seg.sanitizedContent.length}`
  ])
  const lines = [
    '[ISL] Instruction Sanitization Layer',
    BORDER,
    `Segments: ${meta.totalSegments} (sanitized: ${meta.sanitizedSegments})`,
    ...processingTimeLine,
    ...segmentLines,
    '',
    formatLineageForAudit(result.lineage)
  ]
  return lines.join('\n')
}

/**
 * Formats ISL signal for audit - ordered and human-readable
 *
 * @param signal - ISL signal (or compatible shape)
 * @returns Formatted string for auditing
 */
export function formatISLSignalForAudit(signal: ISLSignalLike): string {
  const pd = signal.piDetection
  const patternLine =
    pd.patterns && pd.patterns.length > 0 ? [`${SEP}Patterns: ${pd.patterns.join(', ')}`] : []
  const lines = [
    '[ISL Signal] External contract',
    BORDER,
    `Risk score: ${signal.riskScore.toFixed(3)}`,
    `Has threats: ${signal.hasThreats}`,
    `Timestamp: ${new Date(signal.timestamp).toISOString()}`,
    `Detections: ${pd.detections.length} (score: ${pd.score.toFixed(3)}, detected: ${pd.detected})`,
    ...patternLine
  ]
  return lines.join('\n')
}

/**
 * Formats AAL decision reason and optional removal plan for audit
 *
 * @param reason - Decision reason (or compatible shape)
 * @param removalPlan - Optional removal plan (or compatible shape)
 * @returns Formatted string for auditing
 */
export function formatAALForAudit(reason: DecisionReasonLike, removalPlan?: RemovalPlanLike | null): string {
  const plan = removalPlan ?? undefined
  const removalBlock: string[] =
    plan === undefined
      ? []
      : [
          '',
          `Removal enabled: ${plan.removalEnabled}`,
          `Should remove: ${plan.shouldRemove}`,
          ...(plan.instructionsToRemove.length > 0
            ? [
                `Instructions to remove: ${plan.instructionsToRemove.length}`,
                ...plan.instructionsToRemove.map(
                  (inst, i) =>
                    `${SEP}${i + 1}. ${inst.type ?? 'unknown'} - ${inst.description ?? inst.pattern ?? ''}`
                )
              ]
            : [])
        ]
  const lines = [
    '[AAL] Agent Action Lock',
    BORDER,
    `Action: ${reason.action}`,
    `Risk score: ${reason.riskScore.toFixed(3)} (threshold: ${reason.threshold.toFixed(3)})`,
    `Reason: ${reason.reason}`,
    `Threats: ${reason.hasThreats} (count: ${reason.detectionCount})`,
    ...removalBlock
  ]
  return lines.join('\n')
}

/**
 * Formats CPE result for audit - ordered and human-readable
 *
 * @param result - CPE result (or compatible shape)
 * @returns Formatted string for auditing
 */
export function formatCPEForAudit(result: CPEResultLike): string {
  const env = result.envelope
  const protocolVersionLine =
    typeof env.metadata.protocolVersion === 'string'
      ? [`Protocol version: ${env.metadata.protocolVersion}`]
      : []
  const processingTimeLine =
    typeof result.processingTimeMs === 'number'
      ? [`Processing time: ${result.processingTimeMs}ms`]
      : []
  const lines = [
    '[CPE] Cryptographic Prompt Envelope',
    BORDER,
    `Nonce: ${env.metadata.nonce}`,
    `Timestamp: ${new Date(env.metadata.timestamp).toISOString()}`,
    ...protocolVersionLine,
    `Signature algorithm: ${env.signature.algorithm}`,
    ...processingTimeLine,
    '',
    formatLineageForAudit(env.lineage)
  ]
  return lines.join('\n')
}

/**
 * Builds a full pipeline audit report (CSL → ISL → CPE) from layer results.
 * Accepts minimal shapes for flexibility.
 *
 * @param csl - CSL result (or compatible shape)
 * @param isl - ISL result (or compatible shape)
 * @param cpe - CPE result (or compatible shape)
 * @param options - Optional title and separator
 * @returns Single formatted string for full audit
 */
export function formatPipelineAudit(
  csl: CSLResultLike,
  isl: ISLResultLike,
  cpe: CPEResultLike,
  options?: { title?: string; sectionSeparator?: string }
): string {
  const sep = options?.sectionSeparator ?? '\n\n'
  const title = options?.title ?? 'AI-PIP Pipeline Audit'
  const parts = [
    title,
    BORDER,
    formatCSLForAudit(csl),
    sep,
    formatISLForAudit(isl),
    sep,
    formatCPEForAudit(cpe)
  ]
  return parts.join('\n')
}
