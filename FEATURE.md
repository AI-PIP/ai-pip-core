# Features by version

Summary of **new features** and **modified features** per version (aligned with CHANGELOG).

---

## [0.3.0] – (next / unreleased)

### New

- **ISL – Threat detection**  
  - `detectThreats(content, options?)`: pure, deterministic function returning `readonly PiDetection[]`.  
  - Default patterns for known attack surfaces (prompt-injection, jailbreak, role hijacking, etc.).  
  - `findAllMatches` in `Pattern` for non-overlapping matches, with caps (MAX_MATCHES, MAX_PER_PATTERN) to avoid loops and result explosion.  
  - Integration in `sanitize`: each segment may carry `piDetection` (`PiDetectionResult`).  
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

### Modified

- **sanitize (ISL)**  
  - Uses `detectThreats` per segment and assigns `piDetection` to the segment when detections exist.

- **emitSignal (ISL)**  
  - Computes risk score with the configured strategy (calculators from riskScore module) instead of a fixed formula.  
  - Always includes `metadata.strategy` on the emitted signal.

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
