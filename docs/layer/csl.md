# CSL - Context Segmentation Layer

> **Capa de Segmentación de Contexto** - Primera capa del protocolo AI-PIP

## 📋 Descripción General

La **Context Segmentation Layer (CSL)** es la primera capa del protocolo AI-PIP. Su función principal es segmentar el contenido de entrada en segmentos semánticos y clasificarlos según su nivel de confianza basándose únicamente en su origen.

### Principios Fundamentales

- **Determinismo**: Mismo origen → mismo nivel de confianza, siempre
- **Pureza**: Funciones sin efectos secundarios
- **Inmutabilidad**: Todos los objetos son inmutables
- **Preservación**: El contenido original nunca se pierde

## 🎯 Funcionalidades Principales

### 1. Segmentación de Contenido

La función `segment()` divide el contenido de entrada en segmentos semánticos basándose en reglas de contexto (saltos de línea, delimitadores, etc.).

```typescript
import { segment } from '@ai-pip/core/csl'

const result = segment({
  content: 'Hello\nWorld\n---\nUser input',
  source: 'UI',
  metadata: {}
})

// result.segments contiene los segmentos clasificados
```

### 2. Clasificación por Origen

CSL clasifica cada segmento según su origen (`source`) o tipo de origen (`origin`):

#### Clasificación por Source

- **`UI`** → **TC** (Trusted Content)
- **`SYSTEM`** → **TC** (Trusted Content)
- **`DOM`** → **STC** (Semi-Trusted Content)
- **`API`** → **UC** (Untrusted Content)

#### Clasificación por Origin

- **`SYSTEM_GENERATED`** → **TC**
- **`DOM_VISIBLE`** → **STC**
- **`DOM_HIDDEN`** → **UC**
- **`USER`** → **UC**
- **`UNKNOWN`** → **UC** (fail-secure)

### 3. Inicialización de Linaje

Cada segmento recibe una entrada inicial de linaje que registra:
- **Step**: `'CSL'`
- **Timestamp**: Momento de creación

## 📦 Componentes

### Funciones Principales

- **`segment(input: CSLInput): CSLResult`** - Función principal de segmentación
- **`classifySource(source: Source): TrustLevel`** - Clasifica por source
- **`classifyOrigin(origin: Origin): TrustLevel`** - Clasifica por origin
- **`initLineage(segment: CSLSegment): LineageEntry[]`** - Inicializa linaje
- **`createLineageEntry(step: string): LineageEntry`** - Crea entrada de linaje

### Value Objects

- **`TrustLevel`** - Nivel de confianza (TC, STC, UC)
- **`Origin`** - Origen del contenido
- **`LineageEntry`** - Entrada de linaje
- **`ContentHash`** - Hash del contenido

### Tipos

- **`CSLInput`** - Input para segmentación
- **`CSLResult`** - Resultado de segmentación
- **`CSLSegment`** - Segmento clasificado

## 🔄 Flujo de Procesamiento

```
Input (content + source)
    ↓
Segmentación (splitByContextRules)
    ↓
Clasificación (classifySource/classifyOrigin)
    ↓
Inicialización de Linaje (initLineage)
    ↓
CSLResult (segmentos + linaje)
```

## ✅ Garantías

1. **Integridad**: El contenido original se preserva en cada segmento
2. **Determinismo**: Mismo input → mismo output
3. **Trazabilidad**: Todo segmento tiene linaje inicializado
4. **Fail-Secure**: Orígenes desconocidos se clasifican como UC

## 📝 Ejemplo de Uso

```typescript
import { segment, classifySource } from '@ai-pip/core/csl'

// Segmentar contenido
const result = segment({
  content: 'System prompt\n---\nUser: Hello',
  source: 'UI',
  metadata: { sessionId: '123' }
})

// Cada segmento tiene:
// - id: identificador único
// - content: contenido original preservado
// - source: origen del contenido
// - trust: nivel de confianza (TC, STC, UC)
// - lineage: linaje inicializado con entrada CSL
// - metadata: metadata opcional

// Clasificar un source
const trust = classifySource('UI') // TrustLevel { value: 'TC' }
```

## 🔗 Integración con ISL

CSL pasa su resultado a ISL mediante el contrato:

```typescript
CSLResult {
  segments: CSLSegment[]  // Segmentos clasificados
  lineage: LineageEntry[] // Linaje inicial
}
```

ISL recibe este resultado y aplica sanitización según el `trust` level de cada segmento.

## ⚠️ Limitaciones del Core

El core de CSL **NO incluye**:
- Normalización agresiva de contenido
- Detección de prompt injection (va a ISL)
- Políticas de seguridad (van a ISL)
- Servicios con estado (van al SDK)

Estas funcionalidades se implementan en capas superiores o en el SDK.

