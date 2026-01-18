# TODO: Refactorización ISL → AAL

## Objetivo
Separar las responsabilidades entre ISL (detección y sanitización) y AAL (decisiones y políticas), moviendo las decisiones operativas al SDK.

---

## 📋 FASE 1: Crear estructura AAL (Core Semántico)

### 1.1 Crear `src/aal/types.ts`
- [ ] Crear archivo `src/aal/types.ts`
- [ ] Mover `AnomalyAction` desde `src/isl/types.ts`
  ```typescript
  export type AnomalyAction = 'ALLOW' | 'WARN' | 'BLOCK'
  ```
- [ ] Mover tipos de políticas desde `src/isl/types.ts`:
  - `BlockedIntent`
  - `SensitiveScope`
  - `ProtectedRole`
  - `ImmutableInstruction`
- [ ] Agregar comentario explicando que AAL es Core Semántico (tipos y funciones puras)
- [ ] Agregar import de `RiskScore` desde `../isl/types.js` (se mantiene en ISL)

### 1.2 Crear `src/aal/value-objects/AnomalyScore.ts`
- [ ] Mover archivo `src/isl/value-objects/AnomalyScore.ts` → `src/aal/value-objects/AnomalyScore.ts`
- [ ] Actualizar imports:
  - Cambiar `import type { AnomalyAction, RiskScore } from '../types.js'`
  - A: `import type { AnomalyAction } from '../types.js'`
  - A: `import type { RiskScore } from '../../isl/types.js'`
- [ ] Mantener todo el contenido (tipo, `createAnomalyScore()`, `isHighRisk()`, `isWarnRisk()`, `isLowRisk()`)
- [ ] Agregar comentario: "AAL Core Semántico - tipos y funciones puras para decisiones"

### 1.3 Crear `src/aal/value-objects/PolicyRule.ts`
- [ ] Mover archivo `src/isl/value-objects/PolicyRule.ts` → `src/aal/value-objects/PolicyRule.ts`
- [ ] Actualizar imports:
  - Cambiar `import type { BlockedIntent, ... } from '../types.js'`
  - A: `import type { BlockedIntent, ... } from '../types.js'` (ahora desde AAL)
- [ ] Mantener todo el contenido (tipo, `createPolicyRule()`, funciones puras de verificación)
- [ ] Agregar comentario: "AAL Core Semántico - políticas y verificaciones puras"

### 1.4 Crear `src/aal/value-objects/index.ts`
- [ ] Crear archivo `src/aal/value-objects/index.ts`
- [ ] Exportar tipos:
  ```typescript
  export type { AnomalyScore } from './AnomalyScore.js'
  export type { PolicyRule } from './PolicyRule.js'
  ```
- [ ] Exportar funciones:
  ```typescript
  export {
    createAnomalyScore,
    isHighRisk,
    isWarnRisk,
    isLowRisk
  } from './AnomalyScore.js'
  
  export {
    createPolicyRule,
    isIntentBlocked,
    isScopeSensitive,
    isRoleProtected,
    isInstructionImmutable,
    isContextLeakPreventionEnabled
  } from './PolicyRule.js'
  ```

### 1.5 Crear `src/aal/index.ts`
- [ ] Crear archivo `src/aal/index.ts`
- [ ] Agregar comentario explicando AAL Core Semántico
- [ ] Exportar tipos desde `types.ts`:
  ```typescript
  export type {
    AnomalyAction,
    BlockedIntent,
    SensitiveScope,
    ProtectedRole,
    ImmutableInstruction
  } from './types.js'
  ```
- [ ] Exportar value objects:
  ```typescript
  export type { AnomalyScore, PolicyRule } from './value-objects/index.js'
  export {
    createAnomalyScore,
    isHighRisk,
    isWarnRisk,
    isLowRisk,
    createPolicyRule,
    isIntentBlocked,
    isScopeSensitive,
    isRoleProtected,
    isInstructionImmutable,
    isContextLeakPreventionEnabled
  } from './value-objects/index.js'
  ```

---

## 📋 FASE 2: Limpiar ISL (solo detección y sanitización)

### 2.1 Modificar `src/isl/types.ts`
- [ ] Eliminar `AnomalyAction` (movido a AAL)
- [ ] Eliminar `BlockedIntent` (movido a AAL)
- [ ] Eliminar `SensitiveScope` (movido a AAL)
- [ ] Eliminar `ProtectedRole` (movido a AAL)
- [ ] Eliminar `ImmutableInstruction` (movido a AAL)
- [ ] Eliminar `RemovedInstruction` (va al SDK, no al core)
- [ ] Mantener `RiskScore` (tipo numérico, se mantiene en ISL)
- [ ] Mantener `Position` (se mantiene en ISL)
- [ ] Modificar `ISLSegment`:
  ```typescript
  export interface ISLSegment {
    readonly id: string
    readonly originalContent: string
    readonly sanitizedContent: string
    readonly trust: TrustLevel
    readonly lineage: LineageEntry[]
    readonly piDetection?: PiDetectionResult  // ✅ Mantener (detección)
    // ❌ Eliminar: anomalyScore?: AnomalyScore
    // ❌ Eliminar: instructionsRemoved: RemovedInstruction[]
    readonly sanitizationLevel: 'minimal' | 'moderate' | 'aggressive'
  }
  ```
- [ ] Modificar `ISLResult.metadata`:
  ```typescript
  readonly metadata: {
    readonly totalSegments: number
    readonly sanitizedSegments: number
    // ❌ Eliminar: blockedSegments: number
    // ❌ Eliminar: instructionsRemoved: number
    readonly processingTimeMs?: number
  }
  ```
- [ ] Actualizar comentario del archivo: "ISL solo detecta y sanitiza, no toma decisiones"

### 2.2 Modificar `src/isl/value-objects/PiDetectionResult.ts`
- [ ] Eliminar import de `AnomalyAction`:
  ```typescript
  // Antes:
  import type { AnomalyAction, RiskScore } from '../types.js'
  
  // Después:
  import type { RiskScore } from '../types.js'
  ```
- [ ] Eliminar campo `action` del tipo:
  ```typescript
  export type PiDetectionResult = {
    readonly detections: readonly PiDetection[]
    readonly score: RiskScore  // ✅ Solo score, sin action
    readonly patterns: readonly string[]
    readonly detected: boolean
  }
  ```
- [ ] Eliminar función `determineActionFromScore()` completamente
- [ ] Modificar `createPiDetectionResult()`:
  - Eliminar parámetro `action?: AnomalyAction`
  - Eliminar toda la lógica relacionada con `action` (líneas 67-81)
  - Simplificar a solo calcular score:
  ```typescript
  export function createPiDetectionResult(
    detections: readonly PiDetection[]
  ): PiDetectionResult {
    if (!Array.isArray(detections)) {
      throw new TypeError('PiDetectionResult detections must be an array')
    }
    
    const score = calculateAggregatedScore(detections)
    const patterns: readonly string[] = detections.map(d => d.pattern_type)
    
    return {
      detections: Object.freeze(Array.from(detections)),
      score,
      patterns: Object.freeze(Array.from(patterns)),
      detected: detections.length > 0
    }
  }
  ```
- [ ] Mantener todas las funciones de análisis (`hasDetections()`, `getDetectionCount()`, etc.)

### 2.3 Modificar `src/isl/value-objects/index.ts`
- [ ] Eliminar export de `AnomalyScore`:
  ```typescript
  // ❌ Eliminar:
  // export type { AnomalyScore } from './AnomalyScore.js'
  ```
- [ ] Eliminar exports de funciones de `AnomalyScore`:
  ```typescript
  // ❌ Eliminar:
  // export {
  //   createAnomalyScore,
  //   isHighRisk,
  //   isWarnRisk,
  //   isLowRisk
  // } from './AnomalyScore.js'
  ```
- [ ] Mantener exports de `PiDetection`, `PiDetectionResult`, `Pattern`
- [ ] Agregar comentario: "PolicyRule movido a AAL"

### 2.4 Modificar `src/isl/sanitize.ts`
- [ ] Eliminar import de `RemovedInstruction`:
  ```typescript
  // Antes:
  import type { ISLResult, ISLSegment, RemovedInstruction } from './types.js'
  
  // Después:
  import type { ISLResult, ISLSegment } from './types.js'
  ```
- [ ] Eliminar variable `instructionsRemovedCount`:
  ```typescript
  // ❌ Eliminar: let instructionsRemovedCount = 0
  ```
- [ ] Eliminar lógica de `removedInstructions` en el loop:
  ```typescript
  // ❌ Eliminar:
  // const removedInstructions: RemovedInstruction[] = []
  ```
- [ ] Modificar `ISLSegment` en el loop:
  ```typescript
  const islSegment: ISLSegment = {
    id: cslSegment.id,
    originalContent: cslSegment.content,
    sanitizedContent: sanitized.content,
    trust: cslSegment.trust,
    lineage: addLineageEntry(
      cslSegment.lineage,
      createLineageEntry('ISL', Date.now())
    ),
    // ❌ Eliminar: instructionsRemoved: removedInstructions,
    sanitizationLevel
  }
  ```
- [ ] Eliminar acumulación de `instructionsRemovedCount`:
  ```typescript
  // ❌ Eliminar: instructionsRemovedCount += removedInstructions.length
  ```
- [ ] Modificar `sanitizeContent()`:
  ```typescript
  // Antes:
  function sanitizeContent(
    content: string,
    _level: 'minimal' | 'moderate' | 'aggressive'
  ): { content: string; removed: RemovedInstruction[] } {
    return {
      content,
      removed: []
    }
  }
  
  // Después:
  function sanitizeContent(
    content: string,
    level: 'minimal' | 'moderate' | 'aggressive'
  ): { content: string } {
    // Sanitización = transformación del contenido
    // NO remoción (eso es decisión del SDK basado en AAL)
    return {
      content  // Contenido sanitizado/transformado
    }
  }
  ```
- [ ] Modificar `ISLResult` retornado:
  ```typescript
  return {
    segments: Object.freeze(segments),
    lineage: Object.freeze(allLineage),
    metadata: {
      totalSegments: segments.length,
      sanitizedSegments: segments.length,
      // ❌ Eliminar: blockedSegments: blockedCount,
      // ❌ Eliminar: instructionsRemoved: instructionsRemovedCount
    }
  }
  ```
- [ ] Eliminar variable `blockedCount` (no se usa):
  ```typescript
  // ❌ Eliminar: const blockedCount = 0
  ```
- [ ] Actualizar comentario de `sanitize()`: "ISL solo sanitiza (transforma), no remueve ni bloquea"

### 2.5 Modificar `src/isl/index.ts`
- [ ] Eliminar export de `AnomalyScore`:
  ```typescript
  // ❌ Eliminar de export type:
  // AnomalyScore,
  ```
- [ ] Eliminar exports de funciones de `AnomalyScore`:
  ```typescript
  // ❌ Eliminar:
  // createAnomalyScore,
  // isHighRisk,
  // isWarnRisk,
  // isLowRisk,
  ```
- [ ] Eliminar exports de tipos movidos a AAL:
  ```typescript
  // ❌ Eliminar de export type:
  // AnomalyAction,
  // BlockedIntent,
  // SensitiveScope,
  // ProtectedRole,
  // ImmutableInstruction,
  // RemovedInstruction,
  ```
- [ ] Mantener exports de:
  - `sanitize`
  - `PiDetection`, `PiDetectionResult`, `Pattern`
  - `RiskScore`, `Position`, `ISLSegment`, `ISLResult`
  - Funciones de análisis de detecciones
- [ ] Actualizar comentario del archivo: "ISL solo detecta y sanitiza, las decisiones van a AAL"

---

## 📋 FASE 3: Actualizar exports principales

### 3.1 Modificar `src/index.ts`
- [ ] Agregar sección de re-export AAL:
  ```typescript
  // Re-export AAL
  export {
    createAnomalyScore,
    isHighRisk,
    isWarnRisk,
    isLowRisk,
    createPolicyRule,
    isIntentBlocked,
    isScopeSensitive,
    isRoleProtected,
    isInstructionImmutable,
    isContextLeakPreventionEnabled
  } from './aal/index.js'
  export type {
    AnomalyAction,
    AnomalyScore,
    PolicyRule,
    BlockedIntent,
    SensitiveScope,
    ProtectedRole,
    ImmutableInstruction
  } from './aal/index.js'
  ```
- [ ] Actualizar sección de re-export ISL:
  - Eliminar `AnomalyAction`, `AnomalyScore` de export type
  - Eliminar `createAnomalyScore`, `isHighRisk`, `isWarnRisk`, `isLowRisk` de export
  - Eliminar `BlockedIntent`, `SensitiveScope`, `ProtectedRole`, `ImmutableInstruction`, `RemovedInstruction` de export type
  - Mantener `RiskScore`, `Position`, `ISLSegment`, `ISLResult`, `PiDetection`, `PiDetectionResult`, `Pattern`
- [ ] Actualizar comentario del archivo:
  ```typescript
  /**
   * @ai-pip/core - Core implementation of the AI-PIP protocol
   * 
   * @remarks
   * Main entry point that re-exports all layers (CSL, ISL, CPE, AAL, Shared)
   * 
   * You can import from specific layers:
   * - import { segment } from '@ai-pip/core/csl'
   * - import { sanitize } from '@ai-pip/core/isl'
   * - import { envelope } from '@ai-pip/core/cpe'
   * - import { createAnomalyScore, createPolicyRule } from '@ai-pip/core/aal'
   */
  ```

---

## 📋 FASE 4: Actualizar tests

### 4.1 Buscar y actualizar tests de ISL
- [ ] Buscar archivos de test que usen `AnomalyAction`:
  ```bash
  grep -r "AnomalyAction" test/
  ```
- [ ] Buscar archivos de test que usen `AnomalyScore`:
  ```bash
  grep -r "AnomalyScore" test/
  ```
- [ ] Buscar archivos de test que usen `PolicyRule`:
  ```bash
  grep -r "PolicyRule" test/
  ```
- [ ] Buscar archivos de test que usen `RemovedInstruction`:
  ```bash
  grep -r "RemovedInstruction" test/
  ```
- [ ] Actualizar imports en tests:
  - Cambiar imports de `AnomalyAction`, `AnomalyScore`, `PolicyRule` desde `@ai-pip/core/isl` a `@ai-pip/core/aal`
  - Eliminar tests que usen `RemovedInstruction` (va al SDK)
- [ ] Actualizar tests de `PiDetectionResult`:
  - Eliminar tests que verifiquen campo `action`
  - Eliminar tests de `determineActionFromScore()`
  - Mantener tests de `score` y detecciones
- [ ] Actualizar tests de `sanitize()`:
  - Eliminar verificaciones de `instructionsRemoved`
  - Eliminar verificaciones de `blockedSegments`
  - Mantener verificaciones de `sanitizedContent` y `sanitizationLevel`
- [ ] Crear nuevos tests para AAL:
  - Tests de `createAnomalyScore()`
  - Tests de `isHighRisk()`, `isWarnRisk()`, `isLowRisk()`
  - Tests de `createPolicyRule()`
  - Tests de funciones de verificación de políticas

---

## 📋 FASE 5: Actualizar documentación

### 5.1 Actualizar `README.md`
- [ ] Agregar sección de AAL en la documentación
- [ ] Actualizar descripción de ISL: "ISL detecta y sanitiza contenido, no toma decisiones"
- [ ] Actualizar ejemplos que usen `AnomalyAction`, `AnomalyScore`, `PolicyRule`:
  - Cambiar imports desde `@ai-pip/core/isl` a `@ai-pip/core/aal`
- [ ] Eliminar ejemplos que usen `RemovedInstruction` (documentar que va al SDK)
- [ ] Actualizar sección de "Capas del Protocolo":
  - Agregar AAL como capa semántica
  - Explicar que AAL define tipos y funciones puras
  - Explicar que decisiones operativas van al SDK
- [ ] Actualizar tabla de contenidos si es necesario

### 5.2 Actualizar `CHANGELOG.md`
- [ ] Agregar entrada para la nueva versión (ej: 0.2.0):
  - Documentar creación de capa AAL
  - Documentar separación de responsabilidades ISL/AAL
  - Documentar breaking changes (tipos movidos, campos eliminados)

### 5.3 Crear `src/aal/README.md` (opcional)
- [ ] Crear documentación específica de AAL Core Semántico
- [ ] Explicar qué es AAL y su relación con ISL y SDK
- [ ] Documentar tipos y funciones disponibles
- [ ] Ejemplos de uso

---

## 📋 FASE 6: Verificación final

### 6.1 Verificar compilación
- [ ] Ejecutar `pnpm build` y verificar que no hay errores
- [ ] Verificar que todos los imports están correctos
- [ ] Verificar que no hay referencias a tipos/funciones eliminados

### 6.2 Verificar tests
- [ ] Ejecutar `pnpm test` y verificar que todos pasan
- [ ] Verificar cobertura de tests para AAL

### 6.3 Verificar exports
- [ ] Verificar que `@ai-pip/core` exporta correctamente AAL
- [ ] Verificar que `@ai-pip/core/aal` funciona como subpath
- [ ] Verificar que `@ai-pip/core/isl` ya no exporta tipos de AAL

### 6.4 Verificar documentación
- [ ] Revisar que README.md está actualizado
- [ ] Revisar que todos los ejemplos funcionan
- [ ] Verificar que no hay referencias rotas

---

## 📝 Notas importantes

### Tipos que van al SDK (no al core):
- `RemovedInstruction` → SDK (decisión operativa de remover)
- Lógica de remoción de instrucciones → SDK
- `decideAction()` → SDK (lógica de decisión operativa)
- `lock()` → SDK (ejecución de acciones)

### Tipos que se mantienen en ISL:
- `RiskScore` (tipo numérico)
- `Position` (posición en contenido)
- `PiDetection` (detección individual)
- `PiDetectionResult` (resultado de detección, sin `action`)
- `Pattern` (patrones de detección)

### Tipos que van a AAL (Core Semántico):
- `AnomalyAction` (tipo de acción)
- `AnomalyScore` (score + action)
- `PolicyRule` (políticas)
- `BlockedIntent`, `SensitiveScope`, `ProtectedRole`, `ImmutableInstruction`

### Flujo esperado:
```
1. ISL (Core):
   - Detecta PI → PiDetectionResult (score, detecciones)
   - Sanitiza contenido → sanitizedContent (transformación)
   - NO remueve nada

2. AAL (Core Semántico):
   - Interpreta PiDetectionResult → AnomalyScore (score + action)
   - Verifica PolicyRule → isIntentBlocked(), etc.

3. SDK (AAL Operacional):
   - decideAction() → basado en AnomalyScore + PolicyRule
   - Si decide BLOCK → remueve instrucciones (RemovedInstruction[])
   - Si decide ALLOW → no remueve nada
   - lock() → ejecuta acciones operativas
```

---

## ✅ Checklist de verificación

Antes de hacer commit, verificar:

- [ ] Todos los archivos de AAL están creados y funcionan
- [ ] ISL ya no contiene tipos/funciones de decisiones
- [ ] Todos los imports están actualizados
- [ ] Todos los tests pasan
- [ ] La compilación no tiene errores
- [ ] La documentación está actualizada
- [ ] Los exports principales funcionan correctamente
- [ ] No hay referencias rotas a tipos/funciones eliminados

---

**Última actualización**: 2026-01-XX
**Rama**: `refactor/add-aal-layer-separate-action-decisions`
