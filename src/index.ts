/**
 * @ai-pip/core - Core implementation of the AI-PIP protocol
 * 
 * @remarks
 * Main entry point that re-exports all layers (CSL, ISL, CPE, AAL ,Shared)
 * 
 * You can import from specific layers:
 * - import { segment } from '@ai-pip/core/csl'
 * - import { sanitize } from '@ai-pip/core/isl'
 * - import { envelope } from '@ai-pip/core/cpe' (re-exported from shared/envelope)
 * - import { createAnomalyScore  } from '@ai-pip/core/AAL'
 * 
 * Or import everything from the main entry point:
 * - import { addLineageEntry, segment, sanitize, envelope, createAnomalyScore } from '@ai-pip/core'
 * 
 * Note: Shared functions are only available from the main entry point, not as a subpath.
 */

// Re-export CSL
export {
  segment,
  classifySource,
  classifyOrigin,
  initLineage,
  createLineageEntry,
  generateId,
  splitByContextRules,
  OriginType,
  TrustLevelType,
  ClassificationError,
  SegmentationError
} from './csl/index.js'
export type {
  HashAlgorithm,
  Source,
  CSLInput,
  CSLSegment,
  CSLResult,
  TrustLevel,
  Origin,
  LineageEntry,
  ContentHash
} from './csl/index.js'

// Re-export ISL
export {
  sanitize,
  emitSignal,
  createISLSignal,
  isHighRiskSignal,
  isMediumRiskSignal,
  isLowRiskSignal,
  RiskScoreStrategy,
  getCalculator,
  maxConfidenceCalculator,
  severityPlusVolumeCalculator,
  weightedByTypeCalculator,
  defaultWeightedByTypeCalculator,
  DEFAULT_TYPE_WEIGHTS
} from './isl/index.js'
export type {
  RiskScore,
  ISLSegment,
  ISLResult,
  ISLSignal,
  ISLSignalMetadata,
  EmitSignalOptions,
  RiskScoreCalculator,
  PiDetection,
  PiDetectionResult,
  Pattern,
  SanitizeOptions
} from './isl/index.js'
export {
  createPiDetection,
  getDetectionLength,
  isHighConfidence,
  isMediumConfidence,
  isLowConfidence,
  createPiDetectionResult,
  hasDetections,
  getDetectionCount,
  getDetectionsByType,
  getHighestConfidenceDetection,
  createPattern,
  matchesPattern,
  findMatch,
  MAX_CONTENT_LENGTH,
  MAX_PATTERN_LENGTH,
  MAX_MATCHES,
  createRiskScore,
  normalizeRiskScore,
  isHighRiskScore,
  isMediumRiskScore,
  isLowRiskScore,
  MIN_RISK_SCORE,
  MAX_RISK_SCORE,
  SanitizationError
} from './isl/index.js'

// Re-export Shared
export {
  addLineageEntry,
  addLineageEntries,
  filterLineageByStep,
  getLastLineageEntry,
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
} from './shared/index.js'
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
} from './shared/index.js'

// Re-export envelope (transversal, from shared – no longer a layer)
export { envelope, createNonce, isValidNonce, equalsNonce, createMetadata, isValidMetadata, CURRENT_PROTOCOL_VERSION, createSignature, EnvelopeError } from './shared/envelope/index.js'
export type { Nonce, SignatureVO, ProtocolVersion, Timestamp, NonceValue, SignatureAlgorithm, Signature, CPEMetadata, CPEEvelope, CPEResult } from './shared/envelope/index.js'


// Re-export AAL
export {
    createAnomalyScore,
    isHighRisk,
    isLowRisk,
    isWarnRisk,
    isRoleProtected,
    isContextLeakPreventionEnabled,
    isInstructionImmutable,
    isIntentBlocked,
    isScopeSensitive,
    resolveAgentAction,
    resolveAgentActionWithScore,
    buildDecisionReason,
    buildRemediationPlan,
    buildAALLineage,
    ACTION_DISPLAY_COLORS,
    getActionDisplayColor
} from './AAL/index.js'


export type {
    AnomalyAction,
    AnomalyScore,
    RemediationPlan,
    BlockedIntent,
    SensitiveScope,
    ProtectedRole,
    ImmutableInstruction,
    AgentPolicy,
    DecisionReason,
} from './AAL/index.js'

