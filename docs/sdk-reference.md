# AI-PIP SDK Reference

> **Guía completa del SDK de referencia para AI-PIP**
> 
> Este documento describe todas las funciones y features disponibles en el SDK, incluyendo las que están fuera del core semántico pero son necesarias para implementar el protocolo.

---

## 📋 Tabla de Contenidos

1. [Arquitectura SDK vs Core](#1-arquitectura-sdk-vs-core)
2. [CSL SDK Features](#2-csl-sdk-features)
3. [ISL SDK Features](#3-isl-sdk-features)
4. [CPE SDK Features](#4-cpe-sdk-features)
5. [Shared SDK Features](#5-shared-sdk-features)
6. [Features Avanzadas](#6-features-avanzadas)

---

## 1. Arquitectura SDK vs Core

### Core Semántico
- Define **qué** hace el protocolo
- Funciones puras y deterministas
- Sin estado, sin decisiones, sin implementaciones específicas

### SDK
- Define **cómo** usar el protocolo
- Implementa features necesarias para usar el core
- Puede tener estado, decisiones, serialización, verificación

### Relación

```
┌─────────────────────────────────────┐
│         SDK / Infraestructura       │
│  - Hash generation                  │
│  - MIME detection                   │
│  - Normalization                    │
│  - Semantic segmentation            │
│  - Serialization                    │
│  - Verification                     │
│  - Policy decisions                 │
│  - Audit & analytics               │
└──────────────┬──────────────────────┘
               │ usa
               ▼
┌─────────────────────────────────────┐
│         Core Semántico               │
│  - segment()                        │
│  - sanitize()                       │
│  - envelope()                      │
│  - Value objects                    │
└─────────────────────────────────────┘
```

---

## 2. CSL SDK Features

### Hash y Criptografía

#### `hashContent(content: string, algorithm?: HashAlgorithm): ContentHash`
Genera hash criptográfico del contenido.

```typescript
import { hashContent } from '@ai-pip/sdk/csl'

const hash = hashContent('Hello World', 'sha256')
// { value: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', algorithm: 'sha256' }
```

#### `verifyContentHash(content: string, hash: ContentHash): boolean`
Verifica si un hash corresponde a un contenido.

```typescript
import { verifyContentHash } from '@ai-pip/sdk/csl'

const isValid = verifyContentHash('Hello World', hash) // true
```

### Detección de MIME

#### `detectMimeType(content: string): string`
Detecta el tipo MIME del contenido usando heurísticas.

```typescript
import { detectMimeType } from '@ai-pip/sdk/csl'

detectMimeType('<html><body>Hello</body></html>') // 'text/html'
detectMimeType('{"key": "value"}') // 'application/json'
detectMimeType('function test() {}') // 'application/javascript'
detectMimeType('Hello World') // 'text/plain'
```

**Tipos detectados:**
- `text/html` - HTML
- `application/json` - JSON
- `application/xml` - XML
- `text/css` - CSS
- `application/javascript` - JavaScript
- `text/plain` - Por defecto

### Normalización

#### `normalizeBasic(content: string): string`
Aplica normalización básica al contenido.

```typescript
import { normalizeBasic } from '@ai-pip/sdk/csl'

normalizeBasic('Hello\u200B\u200Cworld') // 'Helloworld'
normalizeBasic('&lt;script&gt;') // '<script>'
normalizeBasic('Hello    World') // 'Hello World'
```

**Normalizaciones aplicadas:**
- Unicode NFC (Canonical Composition)
- Eliminación de zero-width characters (U+200B, U+200C, U+200D, U+FEFF)
- Decodificación de entidades HTML
- Normalización de espacios
- Eliminación de caracteres de control

### Segmentación Semántica

#### `segmentSemantic(content: string, source: Source): string[]`
Segmenta contenido de manera semántica avanzada.

```typescript
import { segmentSemantic } from '@ai-pip/sdk/csl'

segmentSemantic('# Header\nContent', 'UI')
// ['# Header', 'Content']

segmentSemantic('```code\nhere\n```', 'UI')
// ['```code\nhere\n```']
```

**Estrategias:**
1. Bloques de código (```...```)
2. Headers (Markdown #)
3. Listas (- item, * item, 1. item)
4. Párrafos (doble salto de línea)
5. Líneas (fallback)

---

## 3. ISL SDK Features

### Decisiones y Políticas

#### `shouldBlock(result: PiDetectionResult): boolean`
Determina si se debe bloquear basado en el resultado de detección.

```typescript
import { shouldBlock } from '@ai-pip/sdk/isl'

const result = createPiDetectionResult([...])
if (shouldBlock(result)) {
  // Bloquear contenido
}
```

#### `shouldWarn(result: PiDetectionResult): boolean`
Determina si se debe advertir basado en el resultado.

#### `PolicyRule` y Funciones Relacionadas

```typescript
import { 
  createPolicyRule,
  isIntentBlocked,
  isScopeSensitive,
  isRoleProtected
} from '@ai-pip/sdk/isl'

const policy = createPolicyRule(
  '1.0',
  ['delete_user_data', 'modify_system_settings'],
  ['financial_transactions'],
  { protectedRoles: ['system'], immutableInstructions: [...] },
  { enabled: true, blockMetadataExposure: true, ... }
)

if (isIntentBlocked(policy, 'delete_user_data')) {
  // Bloquear intent
}
```

**Componentes de PolicyRule:**
- `blockedIntents` - Intenciones prohibidas
- `sensitiveScope` - Ámbitos sensibles
- `roleProtection` - Protección de roles
- `contextLeakPrevention` - Prevención de fuga de contexto

---

## 4. CPE SDK Features

### Serialización

#### `serializeContent(segments: readonly ISLSegment[]): string`
Serializa contenido sanitizado para firma.

```typescript
import { serializeContent } from '@ai-pip/sdk/cpe'

const serialized = serializeContent(islResult.segments)
// Formato: [0]:content1\n[1]:content2\n...
```

#### `serializeMetadata(metadata: CPEMetadata): string`
Serializa metadata para firma.

```typescript
import { serializeMetadata } from '@ai-pip/sdk/cpe'

const serialized = serializeMetadata(cpeMetadata)
// Formato: timestamp:123|nonce:abc|version:1.0.0|...
```

#### `generateSignableContent(content: string, metadata: string, algorithm: string): string`
Genera contenido completo para firma.

```typescript
import { generateSignableContent } from '@ai-pip/sdk/cpe'

const signable = generateSignableContent(
  serializedContent,
  serializedMetadata,
  'HMAC-SHA256'
)
```

### Verificación

#### `verifySignature(content: string, signature: string, secretKey: string): boolean`
Verifica una firma criptográfica.

```typescript
import { verifySignature } from '@ai-pip/sdk/cpe'

const isValid = verifySignature(
  signableContent,
  envelope.signature.value,
  secretKey
)
```

#### `isValidSignatureFormat(signature: string): boolean`
Valida el formato de una firma.

```typescript
import { isValidSignatureFormat } from '@ai-pip/sdk/cpe'

isValidSignatureFormat('a1b2c3d4...') // true si es hex de 64 chars
```

---

## 5. Shared SDK Features

### Auditoría y Análisis de Lineage

#### `getLineageStats(lineage: readonly LineageEntry[]): {...}`
Obtiene estadísticas del linaje.

```typescript
import { getLineageStats } from '@ai-pip/sdk/shared'

const stats = getLineageStats(lineage)
// {
//   totalEntries: 5,
//   steps: { CSL: 2, ISL: 2, CPE: 1 },
//   timeRange: { start: 1000, end: 1050, duration: 50 },
//   entriesWithNotes: 3
// }
```

#### `getLineageByStep(lineage: readonly LineageEntry[], step: string): readonly LineageEntry[]`
Filtra linaje por step.

#### `getLineageByTimeRange(lineage: readonly LineageEntry[], startTime: number, endTime: number): readonly LineageEntry[]`
Filtra linaje por rango de tiempo.

#### `getLineageByNotes(lineage: readonly LineageEntry[], searchTerm: string): readonly LineageEntry[]`
Busca en las notas del linaje.

#### `isLineageChronological(lineage: readonly LineageEntry[]): boolean`
Verifica si el linaje está en orden cronológico.

#### `getTotalProcessingTime(lineage: readonly LineageEntry[]): number | undefined`
Calcula tiempo total de procesamiento.

#### `getStepSequence(lineage: readonly LineageEntry[]): readonly string[]`
Obtiene secuencia de steps en el linaje.

### LineageEntry con Notes

El SDK puede extender `LineageEntry` con notes para observabilidad:

```typescript
type LineageEntryWithNotes = LineageEntry & {
  readonly notes?: string
}
```

---

## 6. Features Avanzadas

### Integración Completa

```typescript
import { segment } from '@ai-pip/core/csl'
import { sanitize } from '@ai-pip/core/isl'
import { envelope } from '@ai-pip/core/cpe'
import { 
  hashContent, 
  detectMimeType, 
  normalizeBasic 
} from '@ai-pip/sdk/csl'
import { shouldBlock } from '@ai-pip/sdk/isl'
import { verifySignature } from '@ai-pip/sdk/cpe'

// 1. Pre-procesamiento (SDK)
const normalized = normalizeBasic(rawContent)
const mime = detectMimeType(normalized)

// 2. Core: Segmentación
const cslResult = segment({
  content: normalized,
  source: 'UI',
  metadata: { mime }
})

// 3. Core: Sanitización
const islResult = sanitize(cslResult)

// 4. Decisiones (SDK)
if (islResult.segments[0]?.piDetection && shouldBlock(islResult.segments[0].piDetection)) {
  throw new Error('Content blocked')
}

// 5. Core: Envelope
const cpeResult = envelope(islResult, secretKey)

// 6. Verificación (SDK)
const isValid = verifySignature(
  generateSignableContent(...),
  cpeResult.envelope.signature.value,
  secretKey
)
```

### Factory Functions

El SDK proporciona factory functions para facilitar el uso:

```typescript
import { createCSLService } from '@ai-pip/sdk/csl'

const service = createCSLService({
  enablePolicyValidation: true,
  enableLineageTracking: true,
  hashAlgorithm: 'sha256'
})

const result = await service.segment(document.body)
```

### Adapters

El SDK incluye adapters para diferentes entornos:

- `DOMAdapter` - Adaptador para DOM
- `UIAdapter` - Adaptador para UI
- `CryptoHashGenerator` - Generador de hash criptográfico
- `SystemTimestampProvider` - Proveedor de timestamps
- `ConsoleLogger` - Logger para consola

---

## 📊 Resumen de Features SDK

| Categoría | Funciones | Ubicación |
|-----------|-----------|-----------|
| **Hash y Criptografía** | 2 funciones | `@ai-pip/sdk/csl` |
| **Detección MIME** | 1 función | `@ai-pip/sdk/csl` |
| **Normalización** | 1 función | `@ai-pip/sdk/csl` |
| **Segmentación Semántica** | 1 función | `@ai-pip/sdk/csl` |
| **Decisiones ISL** | 2 funciones | `@ai-pip/sdk/isl` |
| **Políticas** | 6 funciones | `@ai-pip/sdk/isl` |
| **Serialización CPE** | 3 funciones | `@ai-pip/sdk/cpe` |
| **Verificación CPE** | 2 funciones | `@ai-pip/sdk/cpe` |
| **Auditoría Lineage** | 7 funciones | `@ai-pip/sdk/shared` |
| **TOTAL** | **25+ funciones** | SDK completo |

---

## 🎯 Uso Recomendado

1. **Core** para lógica de protocolo pura
2. **SDK** para implementación práctica
3. **Adapters** para integración con entornos específicos
4. **Factory Functions** para configuración fácil

El SDK es la capa que hace el core usable en el mundo real, sin perder la pureza semántica del core.

