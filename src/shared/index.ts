/**
 * Shared utilities for all layers - pure functions shared across the core
 *
 * @remarks
 * Lineage handling and AI-PIP audit formatting for clear, flexible auditing.
 */

// Lineage
export {
  addLineageEntry,
  addLineageEntries,
  filterLineageByStep,
  getLastLineageEntry
} from './lineage.js'

// Audit / pretty-print for AI-PIP layers (ordered, human-readable)
export {
  formatLineageForAudit,
  formatCSLForAudit,
  formatISLForAudit,
  formatISLSignalForAudit,
  formatAALForAudit,
  formatCPEForAudit,
  formatPipelineAudit,
  formatPipelineAuditFull,
  formatPipelineAuditAsJson,
  createAuditRunId,
  buildAuditLogEntry,
  buildFullAuditPayload
} from './audit.js'

export type {
  LineageEntryLike,
  CSLResultLike,
  ISLResultLike,
  ISLSignalLike,
  DecisionReasonLike,
  RemediationPlanLike,
  CPEResultLike,
  AuditRunInfo,
  AuditLogSummary,
  FullPipelineAuditOptions,
  PipelineAuditJsonOptions
} from './audit.js'

export type {
  Position,
  SegmentRef
} from './types.js' 


