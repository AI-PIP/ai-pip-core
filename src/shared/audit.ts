/**
 * AI-PIP Audit utilities - Pure functions for ordered, human-readable audit output
 *
 * @remarks
 * These functions format layer results and signals so that the **data** exposed
 * is self-explanatory for an external auditor: each block includes a short
 * explanation of what it represents, human-readable labels (e.g. TC/STC/UC,
 * ALLOW/WARN/BLOCK), and origin/traceability. Visual styling is not part of core;
 * scripts or SDK can consume this text for richer presentation.
 *
 * Supports:
 * - Text report (formatPipelineAudit, formatPipelineAuditFull)
 * - JSON report for logs/machine consumption (buildFullAuditPayload, formatPipelineAuditAsJson)
 * - Run identifier (createAuditRunId) and generatedAt for correlation
 * - Compact log entry (buildAuditLogEntry) for one-line logging
 */

/** Trust level legend for audit output (human-readable) */
const TRUST_LEGEND: Record<string, string> = {
  TC: 'Trusted Content',
  STC: 'Semi-Trusted Content',
  UC: 'Untrusted Content'
}

/** Action legend for audit output */
const ACTION_LEGEND: Record<string, string> = {
  ALLOW: 'Allow (risk below warn threshold)',
  WARN: 'Warn (risk above warn, below block)',
  BLOCK: 'Block (risk above block threshold)'
}

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

/** Detection-like shape for audit (pattern_type for grouping) */
export interface DetectionLike {
  readonly pattern_type?: string
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
    /** Optional: per-segment detections (enables "detections: N" and types in audit) */
    readonly piDetection?: {
      readonly detections: ReadonlyArray<DetectionLike>
      readonly detected?: boolean
    }
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
    readonly detections: ReadonlyArray<DetectionLike>
    readonly patterns?: readonly string[]
  }
  /** Optional: strategy used (e.g. MAX_CONFIDENCE) for reproducibility */
  readonly metadata?: { readonly strategy?: string }
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

/** AAL remediation plan shape for audit formatting */
export interface RemediationPlanLike {
  readonly strategy: string
  readonly goals: readonly string[]
  readonly constraints: readonly string[]
  readonly targetSegments: readonly string[]
  readonly needsRemediation: boolean
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

/** Run identifier and timestamp for audit correlation */
export interface AuditRunInfo {
  readonly runId: string
  readonly generatedAt: number
  readonly generatedAtIso: string
}

/** Compact summary for one-line logs (action, risk, detection count) */
export interface AuditLogSummary {
  readonly runId: string
  readonly generatedAt: number
  readonly generatedAtIso: string
  readonly action: string
  readonly riskScore: number
  readonly hasThreats: boolean
  readonly detectionCount: number
}

/** Options for full pipeline audit (text or JSON) */
export interface FullPipelineAuditOptions {
  readonly runId?: string
  readonly generatedAt?: number
  readonly includeCpe?: boolean
  readonly title?: string
  readonly sectionSeparator?: string
}

/** Options for JSON audit output */
export interface PipelineAuditJsonOptions extends FullPipelineAuditOptions {
  readonly compact?: boolean
}

const SEP = '  '
const BORDER = '---'

/**
 * Creates a unique run identifier for audit correlation (e.g. logs, multiple reports).
 * Uses crypto.randomUUID() when available, otherwise a time-based id.
 */
export function createAuditRunId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `audit-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function ensureRunInfo(options?: { runId?: string; generatedAt?: number }): AuditRunInfo {
  const generatedAt = options?.generatedAt ?? Date.now()
  return {
    runId: options?.runId ?? createAuditRunId(),
    generatedAt,
    generatedAtIso: new Date(generatedAt).toISOString()
  }
}

/**
 * Builds a compact audit entry for one-line logging (e.g. logger.info(JSON.stringify(entry))).
 * Lineage is not included; use buildFullAuditPayload for full traceability.
 */
export function buildAuditLogEntry(
  signal: ISLSignalLike,
  reason: DecisionReasonLike,
  options?: { runId?: string; generatedAt?: number }
): AuditLogSummary {
  const run = ensureRunInfo(options)
  return {
    runId: run.runId,
    generatedAt: run.generatedAt,
    generatedAtIso: run.generatedAtIso,
    action: reason.action,
    riskScore: reason.riskScore,
    hasThreats: reason.hasThreats,
    detectionCount: reason.detectionCount
  }
}

function lineageToJson(lineage: readonly LineageEntryLike[]): Array<{ step: string; timestamp: number }> {
  return lineage.map((e) => ({ step: e.step, timestamp: e.timestamp }))
}

function buildCslSection(result: CSLResultLike): Record<string, unknown> {
  return {
    layer: 'CSL',
    segmentCount: result.segments.length,
    segments: result.segments.map((seg) => ({
      id: seg.id,
      trust: seg.trust.value,
      contentLength: seg.content.length
    })),
    lineage: lineageToJson(result.lineage),
    ...(typeof result.processingTimeMs === 'number' && { processingTimeMs: result.processingTimeMs })
  }
}

function buildIslSection(result: ISLResultLike): Record<string, unknown> {
  const meta = result.metadata
  return {
    layer: 'ISL',
    totalSegments: meta.totalSegments,
    sanitizedSegments: meta.sanitizedSegments,
    segments: result.segments.map((seg) => {
      const pi = seg.piDetection
      const detections = pi?.detections
      const detectionTypes = detections?.length ? summarizeDetectionTypes(detections) : 'none'
      return {
        id: seg.id,
        trust: seg.trust.value,
        sanitizationLevel: seg.sanitizationLevel,
        originalLength: seg.originalContent.length,
        sanitizedLength: seg.sanitizedContent.length,
        detections: detections?.length ?? 0,
        detectionTypes
      }
    }),
    lineage: lineageToJson(result.lineage),
    ...(typeof meta.processingTimeMs === 'number' && { processingTimeMs: meta.processingTimeMs })
  }
}

function buildIslSignalSection(signal: ISLSignalLike): Record<string, unknown> {
  const pd = signal.piDetection
  return {
    layer: 'ISL_SIGNAL',
    riskScore: signal.riskScore,
    hasThreats: signal.hasThreats,
    timestamp: signal.timestamp,
    timestampIso: new Date(signal.timestamp).toISOString(),
    piDetection: {
      detected: pd.detected,
      score: pd.score,
      detectionCount: pd.detections.length,
      detectionTypes: summarizeDetectionTypes(pd.detections),
      ...(pd.patterns && pd.patterns.length > 0 && { patterns: [...pd.patterns] })
    },
    ...(signal.metadata?.strategy && { strategy: signal.metadata.strategy })
  }
}

function buildAalSection(reason: DecisionReasonLike, remediationPlan?: RemediationPlanLike | null): Record<string, unknown> {
  const section: Record<string, unknown> = {
    layer: 'AAL',
    action: reason.action,
    reason: reason.reason,
    riskScore: reason.riskScore,
    threshold: reason.threshold,
    hasThreats: reason.hasThreats,
    detectionCount: reason.detectionCount
  }
  if (remediationPlan != null) {
    section.remediationStrategy = remediationPlan.strategy
    section.remediationGoals = remediationPlan.goals
    section.remediationConstraints = remediationPlan.constraints
    section.targetSegments = remediationPlan.targetSegments
    section.needsRemediation = remediationPlan.needsRemediation
  }
  return section
}

function buildCpeSection(result: CPEResultLike): Record<string, unknown> {
  const env = result.envelope
  return {
    layer: 'CPE',
    nonce: env.metadata.nonce,
    timestamp: env.metadata.timestamp,
    timestampIso: new Date(env.metadata.timestamp).toISOString(),
    signatureAlgorithm: env.signature.algorithm,
    lineage: lineageToJson(env.lineage),
    ...(typeof env.metadata.protocolVersion === 'string' && { protocolVersion: env.metadata.protocolVersion }),
    ...(typeof result.processingTimeMs === 'number' && { processingTimeMs: result.processingTimeMs })
  }
}

/**
 * Builds the full pipeline audit payload (JSON-serializable) with run id, timestamp, summary for logs, and section data.
 * Preserves lineage in each section for traceability. Use formatPipelineAuditAsJson to get a JSON string.
 */
export function buildFullAuditPayload(
  csl: CSLResultLike,
  isl: ISLResultLike,
  signal: ISLSignalLike,
  reason: DecisionReasonLike,
  options?: FullPipelineAuditOptions & { remediationPlan?: RemediationPlanLike | null; cpe?: CPEResultLike | null }
): Record<string, unknown> {
  const run = ensureRunInfo(options)
  const remediationPlan = options?.remediationPlan ?? undefined
  const cpe = options?.cpe
  const includeCpe = options?.includeCpe === true && cpe != null

  const payload: Record<string, unknown> = {
    runId: run.runId,
    generatedAt: run.generatedAt,
    generatedAtIso: run.generatedAtIso,
    summary: {
      action: reason.action,
      riskScore: reason.riskScore,
      hasThreats: reason.hasThreats,
      detectionCount: reason.detectionCount
    },
    sections: {
      csl: buildCslSection(csl),
      isl: buildIslSection(isl),
      islSignal: buildIslSignalSection(signal),
      aal: buildAalSection(reason, remediationPlan),
      ...(includeCpe && cpe && { cpe: buildCpeSection(cpe) })
    }
  }
  return payload
}

/** Summarizes detection types for audit (e.g. "prompt-injection (2), jailbreak (1)") */
function summarizeDetectionTypes(detections: ReadonlyArray<DetectionLike>): string {
  if (detections.length === 0) return 'none'
  const counts: Record<string, number> = {}
  for (const d of detections) {
    const t = d.pattern_type ?? 'unknown'
    counts[t] = (counts[t] ?? 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([type, n]) => `${type} (${n})`)
    .join(', ')
}

/**
 * Formats lineage entries for audit - chronological traceability
 *
 * @param lineage - Array of lineage entries (any layer)
 * @returns Formatted string with short legend and chronological steps
 */
export function formatLineageForAudit(lineage: readonly LineageEntryLike[]): string {
  if (lineage.length === 0) return 'Lineage: (none)\n  Data: chronological list of processing steps (CSL, ISL, CPE, etc.) with timestamp.'
  const legend = 'Chronological traceability: each entry is a processing step with timestamp.'
  const lines = lineage.map((e, i) => `${SEP}${i + 1}. [${e.step}] ${new Date(e.timestamp).toISOString()}`)
  return ['Lineage:', legend, BORDER, ...lines].join('\n')
}

/**
 * Formats CSL result for audit - data self-explanatory for external auditor
 *
 * @param result - CSL result (or compatible shape)
 * @returns Formatted string: what this block is, data origin, trust legend, per-segment data
 */
export function formatCSLForAudit(result: CSLResultLike): string {
  const header = 'Content segmented and classified by trust. Trust levels: TC=Trusted Content, STC=Semi-Trusted Content, UC=Untrusted Content.'
  const origin = 'Data from: CSL segmentation result (input split into segments with trust per segment).'
  const processingTimeLine =
    typeof result.processingTimeMs === 'number'
      ? [`Processing time: ${result.processingTimeMs}ms`]
      : []
  const segmentLines = result.segments.map((seg, i) => {
    const trustLabel = TRUST_LEGEND[seg.trust.value] ?? seg.trust.value
    return `${SEP}Segment ${i + 1}: id=${seg.id} trust=${seg.trust.value} (${trustLabel}) content_length=${seg.content.length}`
  })
  const lines = [
    '[CSL] Context Segmentation Layer',
    header,
    origin,
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
 * Formats ISL result for audit - data self-explanatory; per-segment detections when present
 *
 * @param result - ISL result (or compatible shape)
 * @returns Formatted string: what this block is, data origin, per-segment trust/level/length/detections
 */
export function formatISLForAudit(result: ISLResultLike): string {
  const header = 'Content sanitized by ISL; sanitization level per segment (minimal/moderate/aggressive). Per segment: trust, level, length before/after, detections (if any).'
  const origin = 'Data from: ISL sanitization result (each segment may have piDetection with threat detections).'
  const meta = result.metadata
  const processingTimeLine =
    typeof meta.processingTimeMs === 'number' ? [`Processing time: ${meta.processingTimeMs}ms`] : []
  const segmentLines = result.segments.flatMap((seg, i) => {
    const trustLabel = TRUST_LEGEND[seg.trust.value] ?? seg.trust.value
    const base = [
      `${SEP}Segment ${i + 1}: id=${seg.id} trust=${seg.trust.value} (${trustLabel}) level=${seg.sanitizationLevel}`,
      `${SEP}  original_length=${seg.originalContent.length} sanitized_length=${seg.sanitizedContent.length}`
    ]
    const pi = seg.piDetection
    const detections = pi?.detections
    if (detections?.length) {
      const types = summarizeDetectionTypes(detections)
      base.push(`${SEP}  detections: ${detections.length} (types: ${types})`)
    } else if (pi?.detected) {
      base.push(`${SEP}  detections: yes (count/type not available)`)
    } else {
      base.push(`${SEP}  detections: none`)
    }
    return base
  })
  const lines = [
    '[ISL] Instruction Sanitization Layer',
    header,
    origin,
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
 * Formats ISL signal for audit - data self-explanatory; risk score and detection types
 *
 * @param signal - ISL signal (or compatible shape)
 * @returns Formatted string: what this block is, data origin, risk score (0-1), hasThreats, detection types
 */
export function formatISLSignalForAudit(signal: ISLSignalLike): string {
  const header = 'Risk signal for AAL: summarizes threats and global risk. riskScore (0-1, higher = more risk), hasThreats (true if any detections), detections (count and types).'
  const origin = 'Data from: signal emitted by ISL for AAL (external contract; AAL uses this to decide ALLOW/WARN/BLOCK).'
  const pd = signal.piDetection
  const detectionTypes = summarizeDetectionTypes(pd.detections)
  const strategyLine =
    signal.metadata?.strategy ? [`${SEP}Strategy: ${signal.metadata.strategy} (used to compute risk score)`] : []
  const patternLine =
    pd.patterns && pd.patterns.length > 0 ? [`${SEP}Patterns matched: ${pd.patterns.join(', ')}`] : []
  const lines = [
    '[ISL Signal] External contract',
    header,
    origin,
    BORDER,
    `Risk score: ${signal.riskScore.toFixed(3)} (0-1, higher = more risk)`,
    `Has threats: ${signal.hasThreats} (true if any detections present)`,
    `Timestamp: ${new Date(signal.timestamp).toISOString()}`,
    `Detections: ${pd.detections.length} (aggregated score: ${pd.score.toFixed(3)}, detected: ${pd.detected})`,
    `Detection types: ${detectionTypes}`,
    ...strategyLine,
    ...patternLine
  ]
  return lines.join('\n')
}

/**
 * Formats AAL decision reason and optional remediation plan for audit
 *
 * @param reason - Decision reason (or compatible shape)
 * @param remediationPlan - Optional remediation plan (or compatible shape)
 * @returns Formatted string: action (ALLOW/WARN/BLOCK), reason, thresholds, remediation plan
 */
export function formatAALForAudit(reason: DecisionReasonLike, remediationPlan?: RemediationPlanLike | null): string {
  const header = 'Agent Action Lock decision. Action (ALLOW/WARN/BLOCK), reason in plain language, thresholds used (warn/block), remediation plan (what to do; SDK/AI agent performs cleanup).'
  const origin = 'Data from: AAL decision (resolveAgentAction + buildDecisionReason + optional buildRemediationPlan).'
  const actionLabel = ACTION_LEGEND[reason.action] ?? reason.action
  const plan = remediationPlan ?? undefined
  const remediationBlock: string[] =
    plan === undefined
      ? []
      : [
          '',
          `Remediation strategy: ${plan.strategy}`,
          `Needs remediation: ${plan.needsRemediation}`,
          `Target segments: ${plan.targetSegments.length} [${plan.targetSegments.slice(0, 5).join(', ')}${plan.targetSegments.length > 5 ? '...' : ''}]`,
          `Goals: ${plan.goals.join(', ')}`,
          `Constraints: ${plan.constraints.join(', ')}`
        ]
  const lines = [
    '[AAL] Agent Action Lock',
    header,
    origin,
    BORDER,
    `Action: ${reason.action} (${actionLabel})`,
    `Risk score: ${reason.riskScore.toFixed(3)} (threshold: ${reason.threshold.toFixed(3)})`,
    `Reason: ${reason.reason}`,
    `Threats: ${reason.hasThreats} (detection count: ${reason.detectionCount})`,
    ...remediationBlock
  ]
  return lines.join('\n')
}

/**
 * Formats CPE result for audit - data self-explanatory
 *
 * @param result - CPE result (or compatible shape)
 * @returns Formatted string: what this block is, data origin, nonce, timestamp, signature
 */
export function formatCPEForAudit(result: CPEResultLike): string {
  const header = 'Cryptographic envelope: nonce (unique per request), timestamp, signature (integrity).'
  const origin = 'Data from: CPE envelope result (wraps sanitized content for integrity verification).'
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
    header,
    origin,
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
 * Use formatPipelineAuditFull when you need ISL Signal and AAL included.
 *
 * @param csl - CSL result (or compatible shape)
 * @param isl - ISL result (or compatible shape)
 * @param cpe - CPE result (or compatible shape)
 * @param options - Optional title and separator; use includeSignalAndAAL to add Signal + AAL sections
 * @returns Single formatted string for full audit
 */
export function formatPipelineAudit(
  csl: CSLResultLike,
  isl: ISLResultLike,
  cpe: CPEResultLike,
  options?: {
    title?: string
    sectionSeparator?: string
    includeSignalAndAAL?: boolean
    signal?: ISLSignalLike
    aalReason?: DecisionReasonLike
    remediationPlan?: RemediationPlanLike | null
  }
): string {
  const sep = options?.sectionSeparator ?? '\n\n'
  const title = options?.title ?? 'AI-PIP Pipeline Audit'
  const parts = [title, BORDER, formatCSLForAudit(csl), sep, formatISLForAudit(isl)]

  if (options?.includeSignalAndAAL && options.signal != null && options.aalReason != null) {
    parts.push(sep, formatISLSignalForAudit(options.signal), sep, formatAALForAudit(options.aalReason, options.remediationPlan ?? undefined))
  }

  parts.push(sep, formatCPEForAudit(cpe))
  return parts.join('\n')
}

/**
 * Full pipeline audit report (CSL → ISL → ISL Signal → AAL → optional CPE) with run id and timestamp.
 * Unites all layers for a single audit view. Lineage is included in each section.
 *
 * @param csl - CSL result
 * @param isl - ISL result
 * @param signal - ISL signal (for AAL)
 * @param aalReason - AAL decision reason
 * @param remediationPlan - Optional remediation plan
 * @param cpe - Optional CPE result (included when includeCpe is true)
 * @param options - runId, generatedAt, includeCpe, title, sectionSeparator
 * @returns Formatted string with header (runId, generatedAt) and all sections
 */
export function formatPipelineAuditFull(
  csl: CSLResultLike,
  isl: ISLResultLike,
  signal: ISLSignalLike,
  aalReason: DecisionReasonLike,
  remediationPlan?: RemediationPlanLike | null,
  cpe?: CPEResultLike | null,
  options?: FullPipelineAuditOptions
): string {
  const run = ensureRunInfo(options)
  const sep = options?.sectionSeparator ?? '\n\n'
  const title = options?.title ?? 'AI-PIP Pipeline Audit (full)'
  const includeCpe = options?.includeCpe === true && cpe != null

  const header = [
    title,
    BORDER,
    `Run ID: ${run.runId}`,
    `Generated at: ${run.generatedAtIso}`,
    BORDER
  ].join('\n')

  const parts = [
    header,
    sep,
    formatCSLForAudit(csl),
    sep,
    formatISLForAudit(isl),
    sep,
    formatISLSignalForAudit(signal),
    sep,
    formatAALForAudit(aalReason, remediationPlan ?? undefined)
  ]

  if (includeCpe && cpe) {
    parts.push(sep, formatCPEForAudit(cpe))
  }

  return parts.join('\n')
}

/**
 * Full pipeline audit as JSON string (for logs, SIEM, machine consumption).
 * Preserves lineage in each section. Use buildFullAuditPayload for the raw object.
 *
 * @param options.compact - If true, single-line JSON; otherwise pretty-printed
 * @returns JSON string of the full audit payload
 */
export function formatPipelineAuditAsJson(
  csl: CSLResultLike,
  isl: ISLResultLike,
  signal: ISLSignalLike,
  reason: DecisionReasonLike,
  options?: PipelineAuditJsonOptions & { remediationPlan?: RemediationPlanLike | null; cpe?: CPEResultLike | null }
): string {
  const payload = buildFullAuditPayload(csl, isl, signal, reason, options)
  return options?.compact === true ? JSON.stringify(payload) : JSON.stringify(payload, null, 2)
}
