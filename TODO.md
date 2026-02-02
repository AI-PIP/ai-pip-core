

# Core Improvements TODO (Coherence & SDK Alignment)

This TODO list is derived from `CORE_COHERENCE_ISSUES.md` and represents the recommended order of work to restore and improve coherence between the core (@ai-pip/core) and the SDK.

---

## 🥇 Priority 1 — ISL must detect and propagate threats (BLOCKER)

**Goal:** The core must reflect real threats present in the content.

- [x] Ensure `sanitize()` (or an internal detection phase in ISL) produces threat detections:
  - prompt-injection
  - jailbreak
  - role hijacking
  - script-like
  - hidden text / structural anomalies
- [x] Persist detections in `ISLResult` (per-segment or aggregated).
- [x] Ensure `emitSignal(islResult)` derives `hasThreats === true` when detections exist.

**Success criteria:**
- Malicious test pages return `hasThreats: true`.
- ISL is no longer “silent” when threats are present.

---

## 🥈 Priority 2 — RiskScore must be derived from core detections

**Goal:** Risk score must be coherent and non-zero when threats exist.

- [ ] Update `emitSignal()` to compute `riskScore` from ISL detections.
- [ ] Use a simple, explicit formula (e.g. max confidence or weighted average).
- [ ] Document the chosen formula (even if provisional).

**Success criteria:**
- `riskScore > 0` whenever detections exist.
- AAL can correctly recommend WARN or BLOCK based on policy thresholds.

---

## 🥉 Priority 3 — buildRemovalPlan must generate actionable instructions

**Goal:** BLOCK decisions must result in real, applicable removals.

- [x] Update `buildRemovalPlan(islSignal, policy)` to:
  - return `shouldRemove: true` when `hasThreats && policy.removal.enabled`
  - populate `instructionsToRemove` from detections
- [x] Ensure instructions include enough positional data (segmentId + offsets/ranges): `buildRemovalPlanFromResult(islResult, policy)`.
- [x] Validate `applyRemovalPlan(islResult, plan)` removes only malicious fragments (pure, merges overlapping ranges).

**Success criteria:**
- In demo (BLOCK), “AFTER” content differs from “BEFORE”.
- Only malicious instructions are removed.

---

## 🟡 Priority 4 — Resolve dual source of truth (core vs SDK)

**Goal:** Avoid mismatches between core decisions and SDK detections.

**Recommended (short-term):**
- [ ] Expose a core API to accept external detections (from SDK ThreatAnalyzer).
- [ ] Merge external detections into `ISLResult` before `emitSignal()`.

**Alternative (long-term):**
- [ ] Move detection logic fully into the core.

**Success criteria:**
- No scenario where core reports `riskScore = 0 / ALLOW` while SDK reports many threats.

---

## 5. Audit data and readability (core 0.3.0)

**Goal:** The core focuses on **what data** the audit formatters expose so an external auditor can understand what they are reading without internal jargon. **Visual presentation is not part of the core**; a separate script (e.g. `scripts/audit-report.mjs`) can consume the formatted strings for a nicer view (menus, colors, BEFORE vs AFTER diff).

### 5.1 Principles (core = data, scripts = presentation)

- **Glossary in context**: Each audit block (CSL, ISL, ISL Signal, AAL, Lineage) includes a short explanation of what it represents and what the fields mean.
- **Human-readable labels**: TC/STC/UC, ALLOW/WARN/BLOCK, risk score (0–1), detections (count and types) are explained in the output.
- **Origin and traceability**: Each section states where the data comes from (p. ej. “Resultado de la segmentación CSL”, “Señal emitida por ISL para AAL”) so an auditor understands the flow.

### 5.2 Implemented in core (shared/audit.ts)

| Area | What the formatter exposes (data) | Status |
|------|-----------------------------------|--------|
| **CSL (formatCSLForAudit)** | Header: content segmented by trust; legend TC/STC/UC; origin; per segment: id, trust (with label), content_length. | “Contenido segmentado y clasificado por confianza (TC/STC/UC)”. Por segmento: indicar “origen” (p. ej. DOM, rol estructural) si está disponible. | Done |
| **ISL (formatISLForAudit)** | Header: content sanitized by ISL, level per segment; origin; per segment: trust, level, length before/after, **detections: count and types** (when piDetection present). | “Contenido sanitizado por ISL; nivel de sanitización por segmento”. Incluir por segmento: trust, nivel (aggressive/etc.), longitud antes/después, y si hay detecciones en ese segmento (sí/no o contador). | Claridad sobre qué se sanitizó y si hay amenazas por segmento. |
| **ISL Signal (formatISLSignalForAudit)** | Header: risk signal for AAL; origin; riskScore (0–1), hasThreats, **detection types**; strategy when present. | “Señal de riesgo para AAL: resume amenazas y riesgo global”. Explicar en una línea: riskScore (qué es), hasThreats (qué implica), detections (cuántas y de qué tipo). | Done |
| **AAL (formatAALForAudit)** | Header: Agent Action Lock decision; origin; action (ALLOW/WARN/BLOCK with legend), reason, thresholds, removal plan (shouldRemove, instructions to remove). | “Decisión del Agent Action Lock”. Explicar: acción recomendada, razón (en lenguaje claro), umbrales usados (warn/block), y si hay plan de remoción (shouldRemove, cuántas instrucciones). | Done |
| **Lineage (formatLineageForAudit)** | Legend: chronological traceability; each entry = step + timestamp. | “Trazabilidad temporal del pipeline (CSL → ISL)”. Breve leyenda: qué es cada entrada (CSL vs ISL), orden cronológico. | Done |
| **CPE (formatCPEForAudit)** | Header: envelope (nonce, timestamp, signature); origin. | Done |

**BEFORE vs AFTER (removal)**: Not in core; a script (e.g. `scripts/audit-report.mjs`) can add a BEFORE vs AFTER view when removal was applied.



### 5.3 Optional: script(s) for viewing

- **Executive summary / BEFORE vs AFTER**: A script (e.g. `scripts/audit-report.mjs`) can call the core formatters and add a short summary (URL/origin, segments, threats yes/no, AAL decision, removal applied) and/or a BEFORE vs AFTER view per segment when removal was applied. Visual layout and styling stay in the script, not in core.
- **Formula in audit**: Risk score formula is documented; strategy is shown in the signal formatter when present.

- **Readable detections**: Core formatters now show detection types (count and types per segment / in signal).

### 5.4 Success criteria

- A person **external to the project** can read the audit output (console or report) and understand:
  - what CSL, ISL, AAL and Lineage are;
  - what risk score, hasThreats and the ALLOW/WARN/BLOCK decision mean;
  - whether there were detections and in which segments;
  - whether removal was applied and what changed (BEFORE vs AFTER).

Core does **not** implement visual styling; scripts can be added later to display this data in a richer way.

---

## 🟢 Priority 6 — Tests and documentation (after logic is fixed)

**Goal:** Lock correctness and prevent regressions.

- [ ] Add core tests:
  - malicious content → detections → risk > 0 → BLOCK → removal applied
- [ ] Update docs:
  - clarify detection → signal → AAL → removal flow
  - clarify relationship between core and SDK detection
- [ ] Update CHANGELOG for the coherence fixes.

---

## Mejoras menores (versión 0.3.1)

- [ ] Revisar y eliminar duplicación de código si existe (detect, sanitize, formatters, etc.).
- [ ] Revisar orden de imports (sort-imports) en todos los módulos.

---
