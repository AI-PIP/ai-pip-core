# ISL - Instruction Sanitization Layer

> **Capa de Sanitización de Instrucciones** - Segunda capa del protocolo AI-PIP

## 📋 Descripción General

La **Instruction Sanitization Layer (ISL)** es la segunda capa del protocolo AI-PIP. Su función principal es sanitizar el contenido recibido de CSL aplicando diferentes niveles de sanitización según el nivel de confianza de cada segmento.

### Principios Fundamentales

- **Sanitización Diferenciada**: Nivel de sanitización basado en trust level
- **Detección de Prompt Injection**: Identifica patrones maliciosos
- **Preservación de Original**: Mantiene el contenido original para auditoría
- **Políticas Configurables**: Aplica políticas de seguridad

## 🎯 Funcionalidades Principales

### 1. Sanitización por Nivel de Confianza

ISL aplica diferentes niveles de sanitización según el `trust` level del segmento:

- **TC (Trusted Content)**: Sanitización mínima
- **STC (Semi-Trusted Content)**: Sanitización moderada
- **UC (Untrusted Content)**: Sanitización agresiva

```typescript
import { sanitize } from '@ai-pip/core/isl'

const islResult = sanitize(cslResult)

// Cada segmento sanitizado tiene:
// - originalContent: contenido original preservado
// - sanitizedContent: contenido sanitizado
// - sanitizationLevel: 'minimal' | 'moderate' | 'aggressive'
```

### 2. Detección de Prompt Injection

ISL detecta patrones de prompt injection mediante:

- **PiDetection**: Detección individual de patrones
- **PiDetectionResult**: Resultado agregado con score y acción
- **Pattern Matching**: Identificación de patrones maliciosos

### 3. Políticas de Seguridad

ISL aplica políticas configurables mediante `PolicyRule`:

- **Blocked Intents**: Intenciones explícitamente bloqueadas
- **Sensitive Scope**: Temas sensibles que requieren validación
- **Role Protection**: Roles protegidos que no pueden ser sobrescritos
- **Immutable Instructions**: Instrucciones que no pueden ser modificadas
- **Context Leak Prevention**: Prevención de fuga de contexto

### 4. Anomaly Scoring

ISL calcula scores de anomalía para detectar comportamientos sospechosos:

- **AnomalyScore**: Score de anomalía (0-1)
- **AnomalyAction**: Acción recomendada (ALLOW, WARN, BLOCK)

## 📦 Componentes

### Funciones Principales

- **`sanitize(cslResult: CSLResult): ISLResult`** - Función principal de sanitización

### Value Objects

- **`PolicyRule`** - Regla de política de seguridad
- **`PiDetection`** - Detección individual de prompt injection
- **`PiDetectionResult`** - Resultado agregado de detección
- **`AnomalyScore`** - Score de anomalía
- **`Pattern`** - Patrón de detección

### Tipos

- **`ISLInput`** - Input para sanitización (CSLResult)
- **`ISLResult`** - Resultado de sanitización
- **`ISLSegment`** - Segmento sanitizado
- **`RemovedInstruction`** - Instrucción removida durante sanitización
- **`RiskScore`** - Score de riesgo (0-1)
- **`AnomalyAction`** - Acción recomendada

## 🔄 Flujo de Procesamiento

```
CSLResult (segmentos clasificados)
    ↓
Determinar nivel de sanitización (getSanitizationLevel)
    ↓
Sanitizar contenido (sanitizeContent)
    ↓
Detectar prompt injection (opcional)
    ↓
Calcular anomaly score (opcional)
    ↓
Aplicar políticas (PolicyRule)
    ↓
ISLResult (segmentos sanitizados + metadata)
```

## ✅ Garantías

1. **Preservación**: El contenido original se mantiene en `originalContent`
2. **Trazabilidad**: El linaje se actualiza con entrada ISL
3. **Fail-Secure**: Contenido no confiable recibe sanitización agresiva
4. **Configurabilidad**: Políticas personalizables mediante PolicyRule

## 📝 Ejemplo de Uso

```typescript
import { sanitize, createPolicyRule } from '@ai-pip/core/isl'
import { segment } from '@ai-pip/core/csl'

// 1. Segmentar contenido (CSL)
const cslResult = segment({
  content: 'User input with malicious pattern',
  source: 'API',
  metadata: {}
})

// 2. Sanitizar contenido (ISL)
const islResult = sanitize(cslResult)

// Cada segmento sanitizado tiene:
// - id: identificador único
// - originalContent: contenido original preservado
// - sanitizedContent: contenido sanitizado
// - trust: nivel de confianza del segmento original
// - lineage: linaje actualizado con entrada ISL
// - piDetection: detección de prompt injection (opcional)
// - anomalyScore: score de anomalía (opcional)
// - instructionsRemoved: instrucciones removidas
// - sanitizationLevel: nivel aplicado

// 3. Crear política de seguridad
const policy = createPolicyRule(
  '1.0.0',
  ['malicious_intent'],           // Blocked intents
  ['sensitive_data'],             // Sensitive scopes
  {
    protectedRoles: ['system'],    // Protected roles
    immutableInstructions: ['do_not_modify']
  },
  {
    enabled: true,
    blockMetadataExposure: true,
    sanitizeInternalReferences: true
  }
)
```

## 🔗 Integración con CSL y CPE

### Entrada desde CSL

ISL recibe `CSLResult` con segmentos clasificados y sus trust levels.

### Salida hacia CPE

ISL produce `ISLResult` que contiene:

```typescript
ISLResult {
  segments: ISLSegment[]      // Segmentos sanitizados
  lineage: LineageEntry[]     // Linaje actualizado
  metadata: {
    totalSegments: number
    sanitizedSegments: number
    blockedSegments: number
    instructionsRemoved: number
  }
}
```

## ⚠️ Limitaciones del Core

El core de ISL **NO incluye**:
- Implementación completa de detección de patrones (estructura básica)
- Normalización avanzada de contenido (va al SDK)
- Serialización de resultados (va al SDK)
- Servicios con estado (van al SDK)

Estas funcionalidades se implementan en el SDK o en capas superiores.

