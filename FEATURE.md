# Features by version

Summary of **new features** and **modified features** per version (aligned with CHANGELOG).

---

## [0.5.0] – (latest)

### New

- **ISL – Semantic isolation and canonical tags**
  - **ThreatTag**: Structural metadata for semantic isolation: `segmentId`, `startOffset`, `endOffset`, `type` (ThreatTagType), `confidence`. The core does not insert tags into text; the SDK uses this metadata plus the canonical serializer to wrap fragments.
  - **createThreatTag(segmentId, startOffset, endOffset, type, confidence)**: Creates a frozen ThreatTag with validation (non-empty segmentId, 0 ≤ start ≤ end, valid type, confidence in [0, 1]). Throws `TypeError` or `RangeError` on invalid input.
  - **Tag registry**: `VALID_TAG_TYPES` (readonly list of valid threat tag types, aligned with ISL detect) and `isValidThreatTagType(value)` (type guard).
  - **Canonical AI-PIP tag serializer** (`isl/tags/serializer.ts`): Official protocol representation only. It does not apply offsets, does not mutate segments, and does not decide when to encapsulate. The SDK is responsible for applying tags at the correct positions and for resolving multiple/overlapping tags (e.g. by descending offset order).
    - **openTag(type)**: Returns canonical opening tag string, e.g. `<aipip:prompt-injection>`.
    - **closeTag(type)**: Returns canonical closing tag string, e.g. `</aipip:prompt-injection>`.
    - **wrapWithTag(type, content)**: Returns content wrapped with opening and closing tags (pure concatenation).
  - **Namespace**: `AIPIP_NAMESPACE` (`"aipip"`), `AIPIP_TAG_SCHEMA_VERSION` (1). **ThreatTagType**: Alias for tag context (same as ThreatType from detect); single source of truth remains ISL detect.
  - **ISLResult.threatTags**: `readonly ThreatTag[]` — Derived from segment detections in `sanitize()` (only valid ThreatTagType); SDK uses it with the serializer for encapsulation.
  - **buildISLResult(segments, lineage, threatTags, processingTimeMs?)**: **threatTags** is the third parameter (required); **processingTimeMs** is the fourth optional parameter.

### Benefits

- **No semantic corruption**: Core does not modify segment text; it produces metadata and defines the canonical tag format.
- **Auditable and reversible**: Tag format is deterministic and standardized; encapsulation is applied at fragment level by the SDK.
- **Clear responsibility**: SDK applies offsets, insertions, and ordering; the serializer only builds strings, making the tag format part of the formal protocol.

### Methods / API (0.5.0)

| Method / API | Description |
|--------------|-------------|
| **ThreatTag** (type) | `segmentId`, `startOffset`, `endOffset`, `type`, `confidence`. Structural metadata for semantic isolation. |
| **createThreatTag(...)** | Factory; validates and returns frozen ThreatTag. |
| **VALID_TAG_TYPES** | Readonly list of valid ThreatTagType values. |
| **isValidThreatTagType(value)** | Type guard for valid tag type. |
| **openTag(type)** | Canonical opening tag string. |
| **closeTag(type)** | Canonical closing tag string. |
| **wrapWithTag(type, content)** | Content wrapped with open + close tags. |
| **AIPIP_NAMESPACE**, **AIPIP_TAG_SCHEMA_VERSION** | Namespace and schema version for tags. |
| **ThreatTagType** | Alias for threat type in tag context (aligned with detect). |
| **ISLResult.threatTags** | `readonly ThreatTag[]`; derived from detections in sanitize; SDK uses for encapsulation. |
| **buildISLResult(segments, lineage, threatTags, processingTimeMs?)** | New signature: **threatTags** (3rd, required), **processingTimeMs** (4th, optional). |

---

## [0.4.0] – (unreleased)

### New

- **AAL – Remediation plan (what to clean; SDK/AI performs cleanup)**  
  - **RemediationPlan**: `strategy` (e.g. `'AI_CLEANUP'`), `goals: string[]`, `constraints: string[]`, `targetSegments: string[]` (segment IDs with detections), `needsRemediation: boolean`.  
  - **`buildRemediationPlan(islResult, policy)`**: builds the plan from ISL result and policy; when `policy.remediation.enabled` and there are segments with detections, populates targetSegments and goals derived from detection types (e.g. `prompt-injection` → `remove_prompt_injection`).  
  - Policy: **`remediation: { enabled: boolean }`** (replaces `removal`).  
  - AAL describes *what* to do (goals, constraints, target segments); the SDK or an AI tool implements *how* to clean.

- **Shared – Audit with remediation plan**  
  - **RemediationPlanLike**: shared type for audit (same shape as RemediationPlan).  
  - `formatPipelineAuditFull(..., remediationPlan?, cpe?, options?)`, `buildFullAuditPayload`, `formatPipelineAuditAsJson`: accept **`options.remediationPlan`** (replacing removal plan).  
  - `formatAALForAudit(reason, remediationPlan?)`: AAL section includes remediation plan when provided.

- **CPE – Transversal (documented and clarified)**  
  - CPE (Cryptographic Prompt Envelope) is **transversal**: it **ensures the integrity of each layer** for greater security. It is not a sequential processing layer but a **shared capability** that wraps pipeline output (e.g. ISL or AAL result) with a cryptographic envelope (nonce, metadata, HMAC-SHA256), so that the result of each layer can be verified and tampering detected.  
  - Implementation lives in **`shared/envelope`**; the package exports it as **`@ai-pip/core/cpe`** for backward compatibility.  
  - Use **`envelope(islResult, secretKey)`** (or wrap AAL output) to get a `CPEResult`.

### Removed (in 0.4.0)

- **AAL**: `buildRemovalPlan`, `buildRemovalPlanFromResult`, `applyRemovalPlan`, **RemovalPlan**, **RemovedInstruction**. Remediation is produced as a plan only; actual cleanup is done in the SDK (e.g. via an AI cleanup tool).

### Modified

- **AgentPolicy**: `removal` → **`remediation: { enabled: boolean }`**.  
- **Audit**: All full-pipeline formatters and JSON payload use **remediationPlan** / **RemediationPlanLike** instead of removal plan.

### Methods changed (0.4.0)

| Method / API | What changed |
|--------------|--------------|
| **`buildRemediationPlan(islResult, policy)`** | **New**. Returns **RemediationPlan** (strategy, goals, constraints, targetSegments, needsRemediation). Replaces removal-plan builders. |
| **RemediationPlan** (type) | **New**. Replaces RemovalPlan. No `instructionsToRemove`; use targetSegments + goals/constraints for SDK cleanup. |
| **RemediationPlanLike** (shared) | **New**. Audit-friendly shape; replaces RemovalPlanLike. |
| **AgentPolicy.remediation** | **New**. Replaces **`removal`**. `remediation: { enabled: boolean }`. |
| **formatPipelineAuditFull(..., remediationPlan?, ...)** | Fifth argument is **remediationPlan** (was removalPlan). |
| **buildFullAuditPayload / formatPipelineAuditAsJson** | **options.remediationPlan** (replaces removalPlan). |
| **formatAALForAudit(reason, remediationPlan?)** | Second argument is **remediationPlan** (was removalPlan). |
| **buildRemovalPlan**, **buildRemovalPlanFromResult**, **applyRemovalPlan** | **Removed**. Use **buildRemediationPlan** and SDK cleanup. |
| **RemovalPlan**, **RemovedInstruction** | **Removed**. Use **RemediationPlan**. |
| **CPE (Envelope)** | **Clarified**. CPE is **transversal**: it **ensures the integrity of each layer** for greater security (shared capability; implementation in `shared/envelope`; export `@ai-pip/core/cpe`). Not a sequential layer; use `envelope(islResult, secretKey)` to wrap any pipeline result for verification. |

---

## [0.3.0] – 2026-01-08

### New

- **ISL – Threat detection**  
  - `detectThreats(content, options?)`: pure, deterministic function returning `readonly PiDetection[]`.  
  - Default patterns for known attack surfaces (prompt-injection, jailbreak, role hijacking, script_like, hidden_text); expanded set (~287 patterns).  
  - `findAllMatches` in `Pattern` for non-overlapping matches, with caps (MAX_MATCHES, MAX_PER_PATTERN) to avoid loops and result explosion.  
  - Integration in `sanitize`: each segment may carry `piDetection` (`PiDetectionResult`).  
  - `SanitizeOptions.detectThreatsOptions`: optional `patterns`, `maxTotal`, `maxPerPattern`.  
  - Exports: `detectThreats`, `getDefaultThreatPatterns`, `THREAT_TYPES`, `DetectThreatsOptions`, `ThreatType`.

- **ISL – Risk score strategies (RiskScoreStrategy)**  
  - Enum: `MAX_CONFIDENCE`, `SEVERITY_PLUS_VOLUME`, `WEIGHTED_BY_TYPE`.  
  - Interface `RiskScoreCalculator`: pure, deterministic calculators with no side effects.  
  - Implementations: `maxConfidenceCalculator`, `severityPlusVolumeCalculator`, `weightedByTypeCalculator(weights)`, `defaultWeightedByTypeCalculator`, `DEFAULT_TYPE_WEIGHTS`.  
  - `getCalculator(strategy, typeWeights?)`: returns the registered calculator for the strategy.  
  - Strategy chosen once (at `emitSignal`); only registered strategies (auditability and reproducibility).

- **emitSignal – Risk score options**  
  - `EmitSignalOptions`: `timestamp?`, `riskScore?: { strategy, typeWeights? }`.  
  - Default: `RiskScoreStrategy.MAX_CONFIDENCE`.  
  - Backward compatibility: `emitSignal(islResult, timestamp)` still supported.  
  - Risk score derived from aggregated detections using the chosen calculator; result normalized to [0, 1].

- **ISLSignal – Strategy metadata**  
  - `ISLSignal.metadata?: { strategy: RiskScoreStrategy }` for traceability.  
  - `createISLSignal(..., metadata?)` accepts optional metadata.  
  - Strategy used is reflected on the signal (auditability).

- **AAL – Removal plan with real instructions** *(removed in 0.4.0; replaced by RemediationPlan and buildRemediationPlan)*  
  - `RemovedInstruction.segmentId?`: optional segment id when plan is built from ISLResult (for applyRemovalPlan).  
  - `buildRemovalPlanFromResult(islResult, policy)`, `applyRemovalPlan(islResult, plan)`, `buildRemovalPlan(islSignal, policy)`.  
  - In **0.4.0** these were removed; AAL now produces a **remediation plan** (goals, constraints, targetSegments) and the SDK performs cleanup.

- **AAL – Resolve action with score**  
  - `resolveAgentActionWithScore(islSignal, policy)`: returns `{ action, anomalyScore }` for SDK/audit use.

- **Shared – Audit improvements (run id, JSON, logs, full pipeline)**  
  - **Run identifier**: `createAuditRunId()` generates a unique run id; all full-pipeline formatters accept `options.runId` and `options.generatedAt` for correlation across reports and logs.  
  - **Full pipeline audit**: `formatPipelineAuditFull(csl, isl, signal, aalReason, removalPlan?, cpe?, options?)` builds a single report (CSL → ISL → Signal → AAL → optional CPE) with run id and generated-at timestamp; lineage in each section.  
  - **formatPipelineAudit** extended: `options.includeSignalAndAAL`, `options.signal`, `options.aalReason`, `options.removalPlan` to include ISL Signal and AAL sections in the existing pipeline report.  
  - **JSON variant**: `buildFullAuditPayload(csl, isl, signal, reason, options?)` returns a JSON-serializable object (runId, generatedAt, summary, sections with lineage). `formatPipelineAuditAsJson(...)` returns the JSON string; `options.compact: true` for one-line output (logs, SIEM).  
  - **Audit for logs**: `buildAuditLogEntry(signal, reason, options?)` returns a compact summary (`runId`, `generatedAtIso`, `action`, `riskScore`, `hasThreats`, `detectionCount`) for one-line logging.  
  - Types: `AuditRunInfo`, `AuditLogSummary`, `FullPipelineAuditOptions`, `PipelineAuditJsonOptions`.

### Modified

- **sanitize (ISL)**  
  - Uses `detectThreats` per segment and assigns `piDetection` to the segment when detections exist.

- **emitSignal (ISL)**  
  - Computes risk score with the configured strategy (calculators from riskScore module) instead of a fixed formula.  
  - Always includes `metadata.strategy` on the emitted signal.

- **RemovedInstruction (AAL)**  
  - `type` extended to `string` (any ISL pattern_type).  
  - `segmentId?: string` added for actionable removal.

### Methods changed (0.3.0)

Summary of methods and APIs that changed or were added in 0.3.0 (per-method detail).

| Method / API | What changed |
|--------------|--------------|
| **`sanitize(cslResult, options?)`** | New optional second argument **`SanitizeOptions`**: `detectThreatsOptions?: DetectThreatsOptions` (e.g. `patterns`, `maxTotal`, `maxPerPattern`). If omitted, behavior is unchanged (default patterns). |
| **`emitSignal(islResult, options?)`** | Second argument may be **`EmitSignalOptions`** (object) or **number** (timestamp, compatibility). **Options**: `timestamp?`, `riskScore?: { strategy, typeWeights? }`. Default strategy: `MAX_CONFIDENCE`. **Returns**: `ISLSignal` includes **`metadata?: { strategy }`**. |
| **`createISLSignal(riskScore, piDetection, timestamp?, metadata?)`** | New optional fourth argument **`metadata?: ISLSignalMetadata`** (e.g. `{ strategy }`). If provided, included on the returned signal. |
| **`buildRemovalPlan(islSignal, policy)`** | Signature unchanged. **Returns**: `RemovedInstruction` items have **`type`** as `string` (any pattern_type) and do **not** include `segmentId` when built from signal only. |
| **`buildRemovalPlanFromResult(islResult, policy)`** | **New**. Same return shape as `buildRemovalPlan` but built from **ISLResult**; each instruction has **`segmentId`** for use with **`applyRemovalPlan`**. |
| **`applyRemovalPlan(islResult, plan)`** | **New**. Pure function: applies `plan.instructionsToRemove` (only those with **`segmentId`**) to each segment's `sanitizedContent`; clamps ranges to content; merges overlapping and adjacent ranges (punctuation/whitespace only); returns new **ISLResult** (lineage/metadata preserved). |
| **`detectThreats(content, options?)`** | **Options**: `DetectThreatsOptions` with `patterns?`, `maxTotal?`, `maxPerPattern?`. Default patterns **expanded** (~287) for prompt-injection, jailbreak, role_hijacking, script_like, hidden_text. |
| **`getDefaultThreatPatterns()`** | **Returns**: same type; default set **~287 patterns** (cached, frozen). |
| **`resolveAgentActionWithScore(islSignal, policy)`** | **New** (AAL). Returns `{ action, anomalyScore }`; same criteria as `resolveAgentAction`; useful for SDK and audit. |
| **`getCalculator(strategy, typeWeights?)`** | **New**. Returns the risk score calculator for the given strategy; used internally by `emitSignal`. |
| **`ACTION_DISPLAY_COLORS`** / **`getActionDisplayColor(action)`** | **New** (AAL). Color constant per action (ALLOW/WARN/BLOCK) and helper for UI/audit. |
| **RemovedInstruction** (type) | **`type`**: previously literal union; now **`string`**. **`segmentId?: string`** added (optional). |
| **`createAuditRunId()`** | **New** (Shared). Returns a unique run id (UUID or time-based) for audit correlation. |
| **`buildAuditLogEntry(signal, reason, options?)`** | **New** (Shared). Returns compact summary for one-line logging: runId, generatedAtIso, action, riskScore, hasThreats, detectionCount. |
| **`buildFullAuditPayload(csl, isl, signal, reason, options?)`** | **New** (Shared). Returns JSON-serializable object with runId, generatedAt, summary, sections (csl, isl, islSignal, aal, cpe?); lineage in each section. |
| **`formatPipelineAuditFull(csl, isl, signal, aalReason, removalPlan?, cpe?, options?)`** | **New** (Shared). Full pipeline text report (CSL → ISL → Signal → AAL → optional CPE) with run id and generated-at; options: runId, generatedAt, includeCpe, title, sectionSeparator. |
| **`formatPipelineAuditAsJson(...)`** | **New** (Shared). Returns JSON string of full audit payload; options.compact for one-line. |
| **`formatPipelineAudit(csl, isl, cpe, options?)`** | **Extended**. New options: **`includeSignalAndAAL`**, **`signal`**, **`aalReason`**, **`removalPlan`** to include ISL Signal and AAL sections. |

---

## [0.2.0] – 2026-01-26

### New

- **AAL (Agent Action Lock)** as a separate hybrid layer: consumes ISL signal, applies policies (ALLOW/WARN/BLOCK), decides instruction removal, only sanitized content reaches the LLM; contract in core, implementation in SDK.
- **Shared audit utilities**: pure functions for ordered, human-readable output (`formatCSLForAudit`, `formatISLForAudit`, `formatISLSignalForAudit`, `formatAALForAudit`, `formatCPEForAudit`, `formatPipelineAudit`).
- **AAL export path** corrected: `./aal` → `./dist/AAL/`.
- **Tests** for CSL, ISL (signals, emitSignal, buildISLResult, RiskScore), AAL (resolveAgentAction, buildDecisionReason, buildRemovalPlan, buildAALLineage, AnomalyScore, PolicyRule), CPE, shared (audit); ISL Signal → AAL integration; 92%+ coverage.

### Modified

- **ISL (Instruction Sanitization Layer)** refactored: semantic responsibilities only (detection, risk score, sanitization, signal emission); no blocking, allow/warn, or removal (that moves to AAL).
- **README** and documentation: ISL vs AAL clarification, use cases, policy moderation and audit examples.

### Breaking (semantic)

- ISL no longer makes decisions or removes instructions; decision logic is the responsibility of AAL/SDK.

---

## [0.1.8] – 2026-01-04

### Modified

- **Origin classification (CSL)**: deterministic mapping of sources to trust levels per AI-PIP specification (SYSTEM→TC, UI/API→STC, DOM→UC).
- **Sanitization levels**: aligned with corrected trust levels (TC→minimal, STC→moderate, UC→aggressive).
- **Documentation**: usage examples, layer-specific imports, core ↔ SDK relationship, corrected source classification in examples.

---

## [0.1.7] – 2026-01-04

### Modified

- **Type resolution**: `moduleResolution: "nodenext"`, imports with `.js` extension; nested types (e.g. `TrustLevel.value`) resolve correctly in consuming projects.
- **Package**: `tsconfig.json` removed from `files`; only `dist/`, `README.md`, `LICENSE` published.

---

## [0.1.6] – 2025-12-28

### Modified

- **Documentation**: centralized in `ai-pip-docs` repo; README with links to unified documentation.

---

## [0.1.5] – 2025-12-28

### Modified

- **Documentation**: links to whitepaper, roadmap, layer documentation; Shared vs layers clarification; SDK (AAL, Model Gateway) as SDK components.
- **Package**: `src/` removed from `files`; only necessary files in the package.

---

## [0.1.3] – 2025-12-28

### New

- **JavaScript compilation** (`dist/`) and `.d.ts` declaration files for TypeScript.
- **Source maps** for debugging.
- **Scripts**: `test:install`, `prepublishOnly` (build, lint, tests, test:install before publish).

### Modified

- **Publishing**: from publishing `.ts` to publishing compiled `dist/`; exports point to `.js` and `.d.ts`.
- **Imports**: relative paths instead of `@/` alias; type resolution from `node_modules` and subpaths fixed.

### Breaking

- Use of `module: "NodeNext"` and `moduleResolution: "nodenext"` in consumers recommended/required for compatibility.

---

## [0.1.2] – 2025-12-28

- No documented features; version deprecated due to build and `.d.ts` issues.

---

## [0.1.1] – 2025-12-28

- No documented features; version deprecated due to path alias and type resolution issues.

---

## [0.1.0] – 2025-12-28

### New

- **CSL (Context Segmentation Layer)**: content segmentation and classification.
- **ISL (Instruction Sanitization Layer)**: instruction sanitization.
- **CPE (Cryptographic Prompt Envelope)**: cryptographic envelope with HMAC-SHA256.

---

**Current package version**: 0.2.0  
**Next planned version**: 0.3.0 (includes ISL threat detection and risk score strategies).
