# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.4.0] - (unreleased)

### ✨ Added

- **AAL – Remediation plan (what to clean, not how)**
  - `buildRemediationPlan(islResult, policy)`: builds a **RemediationPlan** describing *what* to clean (target segment IDs, goals, constraints). The SDK or an AI tool performs the actual cleanup.
  - **RemediationPlan**: `strategy: 'AI_CLEANUP'`, `goals: string[]` (e.g. `remove_prompt_injection`, `remove_role_hijacking`), `constraints: string[]` (e.g. `preserve_user_intent`, `do_not_add_information`, `do_not_change_language`), `targetSegments: string[]` (segment IDs with detections), `needsRemediation: boolean`.
  - Policy: **`remediation: { enabled: boolean }`** (replaces `removal`).

- **Shared – Audit with remediation plan**
  - **RemediationPlanLike** (shared type) for audit payloads; same shape as RemediationPlan.
  - `formatPipelineAuditFull(..., remediationPlan?, cpe?, options?)` and `buildFullAuditPayload` / `formatPipelineAuditAsJson` accept **`remediationPlan`** in options (replacing removal plan).
  - `formatAALForAudit(reason, remediationPlan?)` documents the remediation plan in the AAL section.

- **CPE – Transversal (documented and clarified)**
  - CPE (Cryptographic Prompt Envelope) is **transversal**: it **ensures the integrity of each layer** for greater security. It is not a sequential processing layer but a shared capability that wraps pipeline output (e.g. ISL or AAL result) with a cryptographic envelope (nonce, metadata, HMAC-SHA256), so that the result of each layer can be verified and tampering detected. Implementation lives in **`shared/envelope`**; the package exports it as **`@ai-pip/core/cpe`** for backward compatibility. Use `envelope(islResult, secretKey)` to wrap any pipeline result.

### 🗑️ Removed

- **AAL – Removal plan and application (moved to SDK)**
  - **Removed**: `buildRemovalPlan`, `buildRemovalPlanFromResult`, `applyRemovalPlan`, **RemovalPlan**, **RemovedInstruction**.
  - The core no longer performs instruction removal; it only produces a remediation plan. The SDK (or an AI cleanup tool) uses the plan to clean the content.

### 🔄 Changed

- **AgentPolicy**: `removal: { enabled }` → **`remediation: { enabled }`**.
- **Audit**: All formatters and payloads use **remediationPlan** / **RemediationPlanLike** instead of removal plan / RemovalPlanLike.

### 📚 Documentation

- **README.md**: Examples and use cases updated to remediation (buildRemediationPlan, RemediationPlan, policy.remediation); audit section uses remediationPlan; SDK responsibility clarified (remediation execution, e.g. AI cleanup). New subsection *CPE as transversal* in Architecture: CPE ensures the **integrity of each layer** for greater security (shared/envelope, export `@ai-pip/core/cpe`); pipeline clarified (CSL → ISL → optional AAL; CPE wraps result for verification).
- **FEATURE.md**: 0.4.0 section with new APIs, removed APIs, and CPE transversal; tables updated for remediation.

### 📎 More information

See **[FEATURE.md](./FEATURE.md)** for API details.

---

## [0.3.0] - (unreleased)

### ✨ Added

- **ISL – Threat detection**
  - `detectThreats(content, options?)`: pure, deterministic function returning `readonly PiDetection[]`.
  - Default patterns for known attack surfaces (prompt-injection, jailbreak, role hijacking, script_like, hidden_text); expanded set (~287 patterns).
  - Integration in `sanitize`: each segment may carry `piDetection` (`PiDetectionResult`).
  - Option `SanitizeOptions.detectThreatsOptions` for custom patterns or limits (`patterns`, `maxTotal`, `maxPerPattern`).
  - `getDefaultThreatPatterns()`: returns the default set (cached, frozen).
  - `THREAT_TYPES` and type `ThreatType` for deterministic taxonomy.

- **ISL – Risk score strategies**
  - Enum `RiskScoreStrategy`: `MAX_CONFIDENCE`, `SEVERITY_PLUS_VOLUME`, `WEIGHTED_BY_TYPE`.
  - Pure calculators: `maxConfidenceCalculator`, `severityPlusVolumeCalculator`, `weightedByTypeCalculator`, `defaultWeightedByTypeCalculator`.
  - `getCalculator(strategy, typeWeights?)`: returns the registered calculator for the strategy.
  - Strategy fixed at `emitSignal`; reflected in `ISLSignal.metadata.strategy` for audit.

- **emitSignal – Risk score options**
  - `EmitSignalOptions`: `timestamp?`, `riskScore?: { strategy, typeWeights? }`.
  - Default: `RiskScoreStrategy.MAX_CONFIDENCE`.
  - Backward compatibility: `emitSignal(islResult, timestamp)` still supported.

- **ISLSignal – Strategy metadata**
  - `ISLSignal.metadata?: { strategy: RiskScoreStrategy }` for traceability.
  - `createISLSignal(..., metadata?)` accepts optional fourth argument `metadata`.

- **AAL – Actionable removal plan**
  - `buildRemovalPlanFromResult(islResult, policy)`: builds `RemovalPlan` from `ISLResult` with `segmentId` per instruction.
  - `applyRemovalPlan(islResult, plan)`: pure function that removes malicious ranges from each segment's `sanitizedContent`; clamps ranges to content; merges overlapping and adjacent ranges (gap only punctuation/whitespace); returns new `ISLResult`.
  - `RemovedInstruction.segmentId?`: optional, present when the plan is built from `ISLResult`.
  - Guards in `resolveAgentAction`, `resolveAgentActionWithScore`, `buildDecisionReason`, `buildRemovalPlan`, and `buildRemovalPlanFromResult` for safe handling of detections and signals.

- **AAL – Resolve action with score**
  - `resolveAgentActionWithScore(islSignal, policy)`: returns `{ action, anomalyScore }` for SDK/audit use.

- **AAL – Colors for UI/audit**
  - `ACTION_DISPLAY_COLORS` and `getActionDisplayColor(action)` for ALLOW/WARN/BLOCK.

- **Shared – Audit improvements (run id, JSON, logs, full pipeline)**
  - **Run identifier**: `createAuditRunId()` generates a unique run id; full-pipeline formatters accept `options.runId` and `options.generatedAt` for correlation across reports and logs.
  - **Full pipeline audit**: `formatPipelineAuditFull(csl, isl, signal, aalReason, removalPlan?, cpe?, options?)` builds a single report (CSL → ISL → Signal → AAL → optional CPE) with run id and generated-at timestamp; lineage preserved in each section.
  - **formatPipelineAudit** extended: `options.includeSignalAndAAL`, `options.signal`, `options.aalReason`, `options.removalPlan` to include ISL Signal and AAL sections in the pipeline report.
  - **JSON variant**: `buildFullAuditPayload(csl, isl, signal, reason, options?)` returns a JSON-serializable object (runId, generatedAt, summary, sections with lineage). `formatPipelineAuditAsJson(...)` returns the JSON string; `options.compact: true` for one-line output (logs, SIEM).
  - **Audit for logs**: `buildAuditLogEntry(signal, reason, options?)` returns a compact summary (runId, generatedAtIso, action, riskScore, hasThreats, detectionCount) for one-line logging.
  - Types: `AuditRunInfo`, `AuditLogSummary`, `FullPipelineAuditOptions`, `PipelineAuditJsonOptions`.

### 🔄 Changed

- **sanitize (ISL)**: optional second argument `SanitizeOptions`; uses `detectThreats` per segment and assigns `piDetection` when detections exist; option `detectThreatsOptions` for patterns or limits.
- **emitSignal (ISL)**: second argument may be `EmitSignalOptions` (object) or `number` (timestamp); computes risk score with configured strategy; includes `metadata.strategy` on the signal.
- **RemovedInstruction (AAL)**: `type` is now `string` (any `pattern_type`); added `segmentId?: string`.

### 📚 Documentation

- **FEATURE.md**: per-version detail of new and modified features; table of methods/APIs changed in 0.3.0 with description of each change.
- **README.md**: audit section updated with run id, full pipeline (formatPipelineAuditFull), JSON variant (buildFullAuditPayload, formatPipelineAuditAsJson), and audit for logs (buildAuditLogEntry); examples for full report and compact log entry.

### 📎 More information

For specific method signatures and API changes in 0.3.0, see **[FEATURE.md](./FEATURE.md)**.

---

## [0.2.0] - 2026-01-26

### ♻️ Architectural Refactor - ISL / AAL Separation

- Refactored ISL (Instruction Sanitization Layer) to be strictly pure and semantic
- Removed all decision-making logic from ISL:
  - No Blocking
  - No allowing
  - No warnings
  - No instruction removal
- ISL is now responsible for:
  - Malicious pattern detection (prompt injection, jailbreak, role hijacking, ...)
  - Risk scoring (RiskScore)
  - Content sanitization
  - Signal emission and lineage preservation

- Introduced AAL (Agent Action Lock) as a distinct hybrid layer:
  - Consume ISL signal (RiskScore, detection)
  - Applies configurable policies (ALLOW / WARN / BLOCK)
  - Decides whether to remove malicious instructions
  - Ensures only sanitized content reaches the LLM
  - Designed as a core-defined contract, implemented at the SDK level

- **Shared audit utilities**: Pure functions for ordered, human-readable audit output (`formatCSLForAudit`, `formatISLForAudit`, `formatISLSignalForAudit`, `formatAALForAudit`, `formatCPEForAudit`, `formatPipelineAudit`) for compliance and debugging

- **Package**: Version set to 0.2.0; AAL export path corrected (`./aal` → `./dist/AAL/`)

### 📚 Documentation

- README.md updated to clarify the new ISL / AAL responsibility split; architecture and layer sections in English
- **Use cases** section added with scenarios (secure chat, policy moderation, audit, DOM/API/SYSTEM sources, lineage)
- Examples for policy-based moderation (ISL + AAL) and audit report using shared formatters
- Audit and pretty-print utilities documented (formatCSLForAudit, formatISLForAudit, formatISLSignalForAudit, formatAALForAudit, formatCPEForAudit, formatPipelineAudit)

### 🧪 Testing

- Added unit tests for CSL (segment, classify), ISL (signals, emitSignal, buildISLResult, RiskScore), AAL (resolveAgentAction, buildDecisionReason, buildRemovalPlan, buildAALLineage, AnomalyScore, PolicyRule), CPE (envelope), and shared (audit formatters)
- Integration tests updated for ISL Signal → AAL flow; all test messages in English
- Coverage target met: **92%+** statements for CSL, ISL, AAL, CPE, and shared layers

### ⚠️ Breaking Semantic Change

- Although public APIs remain mostly stable, ISL behavior has changed semantically
- Consumers must no longer expect ISL to perform actions or remove instructions
- Decision logic must be handled by AAL or the SDK

## [0.1.8] - 2026-01-04

### 🐛 Critical Fixes - Origin Classification

- **Fixed source classification mapping**: Corrected the deterministic trust level classification for all content sources to align with AI-PIP protocol specification
- **Updated trust level assignments**:
  - `SYSTEM` → `TC` (Trusted Content) - System-generated content, fully trusted
  - `UI` → `STC` (Semi-Trusted Content) - User interface content, moderate trust
  - `API` → `STC` (Semi-Trusted Content) - External API content, moderate trust
  - `DOM` → `UC` (Untrusted Content) - DOM/WEB/SCRAPED content, untrusted by default
- **Corrected sanitization levels**: Updated sanitization logic to match the corrected trust levels (TC → minimal, STC → moderate, UC → aggressive)
- **Fixed test suite**: Updated all tests to reflect the correct classification, ensuring consistency across the codebase

#### What This Fixes

**Problem**: During documentation review, inconsistencies were discovered between:
- The actual source classification implementation
- The AI-PIP protocol specification
- Test expectations and assertions
- Documentation examples

**Solution**: 
- Aligned source-to-trust-level mapping with AI-PIP protocol specification
- Updated `classifySource()` function to use correct deterministic mappings
- Corrected all test cases to match the proper classification
- Updated documentation examples to reflect accurate trust levels

**Impact**: 
- ✅ Deterministic trust level classification now matches AI-PIP specification
- ✅ Consistent behavior across all layers (CSL, ISL, CPE)
- ✅ All tests pass with correct expectations
- ✅ Documentation accurately reflects actual behavior
- ✅ Proper sanitization levels applied based on correct trust classification

### 📚 Documentation Improvements

- **Enhanced usage examples**: Added detailed explanations below each code example describing what each script does and how it works in real-world scenarios
- **Layer-specific imports documentation**: Updated examples to show practical usage of layer-specific imports with step-by-step explanations
- **Official SDK announcement**: Added section explaining that `@ai-pip/core` will be used as the foundation for the official AI-PIP SDK
- **Improved example clarity**: Each example now includes context about when and why to use specific functions, making it easier for users to understand the complete processing pipeline
- **Updated source classification examples**: All examples now correctly show the trust levels and sanitization levels for each source type

#### What This Improves

**Problem**: Users visiting the package on npmjs could see code examples but lacked context about:
- What each example actually does in practice
- How the processing pipeline works end-to-end
- When to use specific functions or import strategies
- The relationship between the core package and the official SDK
- Correct trust level classification for different sources

**Solution**: 
- Added detailed explanations below each code example
- Explained the purpose and workflow of each processing step
- Documented the relationship between core and SDK
- Added professional context about real-world usage
- Corrected all source classification examples

**Impact**: 
- ✅ Users can now understand examples without prior knowledge
- ✅ Better onboarding experience for new users
- ✅ Clearer documentation for npmjs visitors
- ✅ Professional presentation of the package capabilities
- ✅ Accurate trust level information in all examples

### 📦 Package Changes

- **Source classification fixes**: Updated `src/csl/classify.ts` with correct source-to-trust-level mappings
- **Test suite updates**: Fixed all test files to match correct classification:
  - `test/core/csl/classify.test.ts`
  - `test/core/csl/segment.test.ts`
  - `test/core/isl/sanitize.test.ts`
  - `test/core/cpe/envelope.test.ts`
  - `test/core/integration.test.ts`
- **README.md updated**: Enhanced with practical examples, explanations, and correct source classification
- **Professional presentation**: Improved clarity and context for all usage examples

### ⚠️ Breaking Changes

**None** - This is a patch version that fixes classification inconsistencies and improves documentation. The API remains unchanged, but the trust level classification behavior is now correct and consistent with the AI-PIP protocol specification.

---

## [0.1.7] - 2026-01-04

### ⚠️ DEPRECATED

**Deprecation reason**: This version has incorrect source classification that doesn't match the AI-PIP protocol specification. The trust level assignments for sources (UI, DOM, API, SYSTEM) are incorrect, which can lead to improper sanitization levels and security vulnerabilities.

**Known issues**:
- Incorrect source-to-trust-level mapping (UI classified as TC instead of STC, DOM as STC instead of UC, API as UC instead of STC)
- Inconsistent behavior with AI-PIP protocol specification
- Tests and documentation don't match actual implementation
- Potential security risks due to incorrect sanitization levels

**Recommendation**: Update to `0.1.8` or higher, which fixes all classification issues and aligns with the AI-PIP protocol specification.

### 🐛 Critical Fixes

#### Type Resolution Fix
- **Fixed nested type resolution**: Changed `moduleResolution` from `"bundler"` to `"nodenext"` in `tsconfig.json`
- **Added explicit file extensions**: All relative imports now include `.js` extension (required by `nodenext`)
- **Fixed type accessibility**: Types with nested properties (e.g., `TrustLevel.value`) now resolve correctly in consuming projects

#### What This Fixes

**Problem**: When importing types from `@ai-pip/core` in SDK projects, TypeScript could not resolve nested type properties:
- `this.data.trust.value` appeared as `any` instead of `TrustLevelType`
- No autocomplete for nested properties
- Type inference failed for complex types

**Root Cause**: Incompatibility between `moduleResolution: "bundler"` (used in `@ai-pip-core`) and `moduleResolution: "nodenext"` (used in SDK projects). TypeScript couldn't follow the chain of type imports correctly.

**Solution**: 
- Aligned `moduleResolution` to `"nodenext"` in both projects
- Added explicit `.js` extensions to all relative imports (required by Node.js ESM resolution)
- Changed `module` from `"ESNext"` to `"NodeNext"` for consistency

**Impact**: 
- ✅ Nested types now resolve correctly
- ✅ Autocomplete works for all type properties
- ✅ Type inference works correctly in consuming projects
- ✅ Better compatibility with Node.js ESM module resolution

### 🔧 Technical Changes

- **Removed `tsconfig.json` from package files**: `tsconfig.json` is only needed for development, not for published packages
- **Updated `tsconfig.json`**:
  - `module: "ESNext"` → `module: "NodeNext"`
  - `moduleResolution: "bundler"` → `moduleResolution: "nodenext"`
- **Updated all source files**: Added `.js` extension to 107+ relative imports across the codebase

### 📦 Package Changes

- **Removed from `files` array**: `tsconfig.json` (only needed for development)
- **Package now includes**: `dist/`, `README.md`, `LICENSE` only

### ⚠️ Breaking Changes

**None** - This is a patch version that fixes type resolution issues without changing the API.

### 📚 Documentation

- Updated README to reference centralized CHANGELOG.md
- Added detailed explanation of type resolution fixes

---

## [0.1.6] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: This version has incorrect source classification that doesn't match the AI-PIP protocol specification. The trust level assignments for sources are incorrect, which can lead to improper sanitization levels and security vulnerabilities.

**Known issues**:
- Incorrect source-to-trust-level mapping
- Inconsistent behavior with AI-PIP protocol specification
- Potential security risks due to incorrect sanitization levels

**Recommendation**: Update to `0.1.8` or higher, which fixes all classification issues and aligns with the AI-PIP protocol specification.

### 📚 Documentation Improvements
- **Centralized documentation**: Moved all protocol documentation to `ai-pip-docs` repository
- **Updated README**: Added comprehensive links to centralized documentation
- **Documentation structure**: Reorganized documentation section with links to whitepaper, architecture, roadmap, and SDK guides

### 🔧 Package Improvements
- **Documentation links**: All documentation now points to `ai-pip-docs` repository
- **README cleanup**: Removed redundant documentation sections, kept only code-specific documentation

---

## [0.1.5] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: This version has incorrect source classification that doesn't match the AI-PIP protocol specification. The trust level assignments for sources are incorrect, which can lead to improper sanitization levels and security vulnerabilities.

**Known issues**:
- Incorrect source-to-trust-level mapping
- Inconsistent behavior with AI-PIP protocol specification
- Potential security risks due to incorrect sanitization levels

**Recommendation**: Update to `0.1.8` or higher, which fixes all classification issues and aligns with the AI-PIP protocol specification.

### 📚 Documentation Improvements
- **Updated README**: Added links to whitepaper, roadmap, and complete layer documentation
- **Updated Roadmap**: Added SDK-browser in Phase 4, updated Phase 1 status to 100% completed
- **Architecture clarification**: Corrected documentation about Shared (not a layer, but shared features)
- **SDK note**: Updated explanation about AAL and Model Gateway (they are SDK components, not core)

### 🔧 Optimizations
- **Package size reduction**: Removed `src/` from `files` field in `package.json` to make the package lighter
- **Optimized package**: Only necessary files are included (`dist/`, `tsconfig.json`, `README.md`, `LICENSE`)

### ✨ Improvements
- **Layer documentation**: Added link to Shared documentation (shared features)
- **Documentation organization**: Reorganized documentation section with priority on whitepaper and roadmap

---

## [0.1.3] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: This version has incorrect source classification that doesn't match the AI-PIP protocol specification. The trust level assignments for sources are incorrect, which can lead to improper sanitization levels and security vulnerabilities.

**Known issues**:
- Incorrect source-to-trust-level mapping
- Inconsistent behavior with AI-PIP protocol specification
- Potential security risks due to incorrect sanitization levels

**Recommendation**: Update to `0.1.8` or higher, which fixes all classification issues and aligns with the AI-PIP protocol specification.

### ✨ New Features
- **JavaScript compilation**: The package now compiles to JavaScript (`dist/`) for better compatibility
- **Type declaration files**: `.d.ts` files are generated for full TypeScript support
- **Source maps**: Included for better debugging

### 🔧 Technical Changes
- **Publication structure**: Changed from publishing `.ts` files directly to compiling to `dist/`
- **Improved exports**: Exports now point to compiled files (`.js` and `.d.ts`)
- **Relative paths**: Replaced path aliases (`@/`) with relative paths for compatibility
- **Build configuration**: Fixed generation of `.d.ts` files in `dist/` instead of `src/`
- **ESLint**: Configured to ignore generated `.d.ts` files

### 🐛 Fixes
- **Type resolution**: TypeScript types now resolve correctly from `node_modules`
- **Imports from subpaths**: Fixed imports from `@ai-pip/core/csl`, `@ai-pip/core/isl`, etc.
- **Complete exports**: Added `default` field to all exports for Node.js ESM
- **File generation**: `.d.ts` files now generate correctly in `dist/`

### 📚 Documentation
- **TypeScript requirements**: Improved documentation about required configuration
- **Updated examples**: Usage examples updated for new structure
- **Complete CHANGELOG**: Documentation of all versions and deprecations

### 🛠️ Development Improvements
- **test:install script**: Script to verify installation before publishing
- **prepublishOnly script**: Automatically runs build, lint, tests, and test:install before publishing

### ⚠️ Breaking Changes
- **TypeScript configuration required**: It's now **mandatory** to use `module: "NodeNext"` and `moduleResolution: "nodenext"` in `tsconfig.json`

---

## [0.1.2] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: This version had issues with compilation and `.d.ts` file generation. Files were generated in incorrect locations (`src/` instead of `dist/`), causing linting errors and type resolution problems.

**Known issues**:
- `.d.ts` files were generated in `src/` instead of `dist/`
- ESLint tried to lint generated `.d.ts` files, causing errors
- Incomplete build configuration (`declarationDir` misconfigured)
- Types did not resolve correctly in some cases

**Recommendation**: Update to `0.1.3` or higher.

---

## [0.1.1] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: This version had issues with path alias resolution (`@/`) that caused errors when importing from other projects. Types did not resolve correctly when the package was installed from npm.

**Known issues**:
- Errors: `Module '"@ai-pip/core/csl"' has no exported member 'CSLResult'`
- Path aliases did not work in consumer projects
- Types did not resolve correctly from `node_modules`

**Recommendation**: Update to `0.1.3` or higher.

---

## [0.1.0] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: Initial version with fundamental compatibility issues. Exports did not include the `default` field required by Node.js ESM, causing `ERR_PACKAGE_PATH_NOT_EXPORTED` errors.

**Known issues**:
- Errors: `ERR_PACKAGE_PATH_NOT_EXPORTED` when importing subpaths
- Incomplete exports: Missing `default` field in exports
- Path aliases did not work correctly

**Recommendation**: Update to `0.1.3` or higher.

### 📦 Initial Content
- **CSL (Context Segmentation Layer)**: Content segmentation and classification
- **ISL (Instruction Sanitization Layer)**: Instruction sanitization
- **CPE (Cryptographic Prompt Envelope)**: Cryptographic envelope with HMAC-SHA256

---

**Current Version**: 0.4.0  
**Status**: Phase 1 - Core Layers (100% completed)

