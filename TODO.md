

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

- [ ] Update `buildRemovalPlan(islSignal, policy)` to:
  - return `shouldRemove: true` when `hasThreats && policy.removal.enabled`
  - populate `instructionsToRemove` from detections
- [ ] Ensure instructions include enough positional data (segmentId + offsets/ranges).
- [ ] Validate `applyRemovalPlanToResult()` removes only malicious fragments.

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

## 5. Mejoras de visualización y auditoría (core 0.3.0)

**Objetivo:** que las salidas del pipeline (formatters de auditoría, reportes, menú de auditoría) sean **claramente legibles por alguien externo al proyecto**, con un nivel de detalle que permita entender qué se está leyendo sin conocer la jerga interna.

### 5.1 Principios

- **Glosario en contexto**: Cada bloque de auditoría (CSL, ISL, ISL Signal, AAL, Lineage) debe ir acompañado de una breve explicación de qué representa y qué campos significan (o un enlace a glosario).
- **Etiquetas humanas**: Evitar solo siglas/acrónimos sin definir: explicar TC/STC/UC, ALLOW/WARN/BLOCK, risk score, detecciones, removal plan.
- **Origen y trazabilidad**: En cada sección, indicar de dónde vienen los datos (p. ej. “Resultado de la segmentación CSL”, “Señal emitida por ISL para AAL”) para que un auditor entienda el flujo.

### 5.2 Mejoras concretas en formatters / salida

| Área | Mejora | Resultado esperado |
|------|--------|--------------------|
| **CSL (formatCSLForAudit)** | Encabezado con 1–2 líneas que expliquen: “Contenido segmentado y clasificado por confianza (TC/STC/UC)”. Por segmento: indicar “origen” (p. ej. DOM, rol estructural) si está disponible. | Un externo entiende qué es cada segmento y qué significa la confianza. |
| **ISL (formatISLForAudit)** | Encabezado: “Contenido sanitizado por ISL; nivel de sanitización por segmento”. Incluir por segmento: trust, nivel (aggressive/etc.), longitud antes/después, y si hay detecciones en ese segmento (sí/no o contador). | Claridad sobre qué se sanitizó y si hay amenazas por segmento. |
| **ISL Signal (formatISLSignalForAudit)** | Encabezado: “Señal de riesgo para AAL: resume amenazas y riesgo global”. Explicar en una línea: riskScore (qué es), hasThreats (qué implica), detections (cuántas y de qué tipo). | El auditor entiende por qué AAL va a recomendar ALLOW/WARN/BLOCK. |
| **AAL (formatAALForAudit)** | Encabezado: “Decisión del Agent Action Lock”. Explicar: acción recomendada, razón (en lenguaje claro), umbrales usados (warn/block), y si hay plan de remoción (shouldRemove, cuántas instrucciones). | Queda claro qué se decidió y por qué; si hay algo que remover, se ve explícito. |
| **Lineage (formatLineageForAudit)** | Encabezado: “Trazabilidad temporal del pipeline (CSL → ISL)”. Breve leyenda: qué es cada entrada (CSL vs ISL), orden cronológico. | Un externo entiende el orden de las operaciones. |
| **ANTES vs DESPUÉS (remoción)** | Encabezado fijo: “Contenido antes y después de aplicar el plan de remoción (solo relevante si eligió BLOCK)”. Por segmento: indicar “[cambió]” o “[sin cambios]” y, si cambió, opcionalmente resumir qué se removió (ej. “1 instrucción removida”). | Validación clara del efecto de la remoción. |

### 5.3 Nivel de detalle para auditorías externas

- **Resumen ejecutivo opcional**: Una sección al inicio del reporte (o del menú de auditoría) con: URL/origen, número de segmentos, si hay amenazas (sí/no), decisión AAL, y si se aplicó remoción. En 3–5 líneas.
- **Detecciones legibles**: Si hay detecciones, no solo “count” sino tipo (prompt-injection, script-like, etc.) y, si el formatter lo permite, un ejemplo o posición (segmento X, offset Y) para que un humano pueda ubicar la amenaza.
- **Documentación de fórmulas**: Donde el core documente risk score (p. ej. max(confidence)), exponer en auditoría una línea tipo “Risk score = max(confidence) de detecciones” para que sea reproducible y comprensible.

### 5.4 Criterio de éxito

- Una persona **externa al proyecto** puede leer la salida de auditoría (consola o reporte) y entender:
  - qué es CSL, ISL, AAL y Lineage;
  - qué significa risk score, hasThreats y la decisión ALLOW/WARN/BLOCK;
  - si hubo detecciones y en qué segmentos;
  - si se aplicó remoción y qué cambió (ANTES vs DESPUÉS).

Estas mejoras pueden implementarse en el core (formatters compartidos) y/o en el SDK (capas de presentación que consuman los formatters del core y añadan texto explicativo).

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
