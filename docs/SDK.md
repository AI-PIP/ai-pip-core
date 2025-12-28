# AI-PIP SDK - Guía de Implementación

> **Software Development Kit (SDK) de referencia para el protocolo AI-PIP**
> 
> El SDK es una capa de integración que consume el core semántico (`@ai-pip/core`) y traduce sus resultados semánticos en acciones operativas según el entorno de ejecución.

**Versión**: 2.0  
**Autor**: Felipe Masliah  
**Última Actualización**: 2025

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Arquitectura SDK vs Core](#2-arquitectura-sdk-vs-core)
3. [Instalación](#3-instalación)
4. [API Principal](#4-api-principal)
5. [Funciones del SDK](#5-funciones-del-sdk)
6. [Tipos TypeScript](#6-tipos-typescript)
7. [Ejemplos de Uso](#7-ejemplos-de-uso)
8. [Integración](#8-integracion)
9. [Configuración](#9-configuración)
10. [Eventos y Callbacks](#10-eventos-y-callbacks)

---

## 1. Introducción

### 1.1 ¿Qué es el SDK?

El SDK de AI-PIP **NO define la seguridad del protocolo**. En su lugar, actúa como:

- **Adaptador**: Traduce entre el core semántico y entornos concretos (navegador, Node.js, edge)
- **Orquestador**: Coordina las funciones puras del core y aplica políticas operativas
- **Integrador**: Proporciona helpers y utilidades para facilitar el uso del protocolo

### 1.2 Relación con el Core

```
┌─────────────────────────────────────┐
│         SDK (Implementación)        │
│  - Adaptadores (DOM, Node, Edge)    │
│  - Políticas operativas             │
│  - Serialización                    │
│  - Verificación criptográfica       │
│  - Decisiones runtime               │
└──────────────┬──────────────────────┘
               │ consume
               ▼
┌─────────────────────────────────────┐
│      Core Semántico (@ai-pip/core)  │
│  - Funciones puras                  │
│  - Value objects inmutables         │
│  - Contratos semánticos             │
│  - Señales de riesgo                │
└─────────────────────────────────────┘
```

**Principio clave**: El SDK orquesta y adapta el core; el core define qué hace el protocolo.

### 1.3 Objetivo del SDK

El SDK permite:

- ✅ Integrar AI-PIP en proyectos JavaScript/TypeScript
- ✅ Usar las capas del protocolo (CSL, ISL, CPE) de forma práctica
- ✅ Adaptar el core a entornos específicos (navegador, servidor, edge)
- ✅ Aplicar políticas operativas basadas en señales del core
- ✅ Recibir notificaciones cuando el SDK interpreta riesgos

**El SDK NO**:
- ❌ Define la lógica de seguridad (eso es el core)
- ❌ Decide qué es seguro (interpreta señales del core)
- ❌ Es el protocolo (es una implementación de referencia)

### 1.4 Características Principales

- ✅ **TypeScript nativo**: Tipos completos y autocompletado
- ✅ **Modular**: Usa solo las capas que necesites
- ✅ **Optimizado para bajo overhead**: Rendimiento dependiente del entorno de ejecución
- ✅ **Extensible**: Fácil de extender con funcionalidades personalizadas
- ✅ **Cross-platform**: Funciona en Node.js, navegadores y entornos edge

---

## 2. Arquitectura SDK vs Core

### 2.1 Separación de Responsabilidades

| Aspecto | Core Semántico | SDK |
|---------|---------------|-----|
| **Propósito** | Define **qué** hace el protocolo | Define **cómo** usar el protocolo |
| **Estado** | Sin estado | Puede tener estado |
| **Dependencias** | Solo funciones puras | Puede usar librerías externas |
| **Decisión** | Produce señales | Toma decisiones operativas |
| **Serialización** | Define estructura | Implementa formato |
| **Verificación** | Define contrato | Implementa validación |
| **Eventos** | No emite eventos | Interpreta resultados y genera eventos |

### 2.2 Flujo de Trabajo

```
1. SDK recibe input del entorno (DOM, prompt, etc.)
   ↓
2. SDK adapta input al formato del core (CSLInput, etc.)
   ↓
3. SDK invoca funciones puras del core (segment, sanitize, envelope)
   ↓
4. Core produce señales semánticas (TrustLevel, AnomalyScore, etc.)
   ↓
5. SDK interpreta señales según políticas configuradas
   ↓
6. SDK ejecuta acciones operativas (bloqueo, logging, eventos)
```

### 2.3 Ejemplo Conceptual

```typescript
// Core: Función pura que produce señales
const cslResult = segment({ content: '...', source: 'UI' })
// cslResult contiene: TrustLevel, LineageEntry, etc.

// SDK: Interpreta señales y ejecuta acciones
if (isUntrusted(cslResult.segments[0].trust)) {
  // Esta decisión es del SDK, no del core
  lock('navigation', 'Untrusted content detected')
  emitRiskEvent({ level: 'high', reason: 'UC detected' })
}
```

---

## 3. Instalación

### 3.1 Paquetes Requeridos

El SDK depende del core semántico:

```bash
# Instalar ambos paquetes
pnpm add @ai-pip/sdk @ai-pip/core

# O con npm
npm install @ai-pip/sdk @ai-pip/core

# O con yarn
yarn add @ai-pip/sdk @ai-pip/core
```

**Nota**: El SDK depende internamente de `@ai-pip/core`. Aunque técnicamente puede instalarse solo el SDK (que incluirá el core como dependencia), es recomendable instalar ambos explícitamente para mayor control.

### 3.2 Importación

```typescript
// Importación completa del SDK
import * as pip from '@ai-pip/sdk'

// Importación selectiva de funciones del SDK
import { scanDOM, scanPrompt, purify, report, lock, onRiskDetected } from '@ai-pip/sdk'

// Importación de tipos del SDK
import type { RiskEvent, SDKOptions, LockResult } from '@ai-pip/sdk'

// Importación directa del core (opcional)
import { segment, sanitize, envelope } from '@ai-pip/core'
import type { CSLResult, ISLResult, CPEResult } from '@ai-pip/core'
```

---

## 4. API Principal

### 4.1 Estructura de la API

El SDK expone una API principal a través del objeto `pip` que actúa como adaptador del core:

```typescript
interface AIPIP {
    // Funciones adaptadoras (invocan el core)
    scanDOM(element?: HTMLElement | Document): Promise<CSLResult>
    scanPrompt(prompt: string): Promise<ISLResult>
    purify(content: string | CSLResult | ISLResult): Promise<CPEResult>
    
    // Funciones operativas (interpretan señales del core)
    report(result: CSLResult | ISLResult | CPEResult): void
    lock(action: string, reason?: string): boolean
    
    // Eventos (generados por el SDK, no por el core)
    onRiskDetected(callback: (risk: RiskEvent) => void): void
    offRiskDetected(callback: (risk: RiskEvent) => void): void
    
    // Configuración
    configure(options: SDKOptions): void
    getConfig(): SDKOptions
    
    // Utilidades
    version: string
}
```

### 4.2 Funciones Adaptadoras

Estas funciones actúan como adaptadores que invocan funciones puras del core AI-PIP y aplican acciones según el entorno:

#### `scanDOM(element?: HTMLElement | Document): Promise<CSLResult>`

**Descripción**: Adapta el DOM del navegador al formato del core y ejecuta `segment()`.

**Flujo interno**:
1. Lee el DOM (o el elemento especificado)
2. Detecta MIME type del contenido
3. Genera hash del contenido
4. Adapta a `CSLInput`
5. Invoca `segment()` del core
6. Retorna `CSLResult` del core

**Ejemplo**:
```typescript
const result = await pip.scanDOM(document.body)
// result es un CSLResult del core, con TrustLevel, LineageEntry, etc.
```

#### `scanPrompt(prompt: string): Promise<ISLResult>`

**Descripción**: Adapta un prompt de texto al formato del core y ejecuta el pipeline CSL → ISL.

**Flujo interno**:
1. Normaliza el prompt
2. Crea `CSLInput` con source 'UI'
3. Invoca `segment()` del core
4. Invoca `sanitize()` del core
5. Retorna `ISLResult` del core

**Ejemplo**:
```typescript
const result = await pip.scanPrompt('User input here')
// result es un ISLResult del core, con señales de sanitización
```

#### `purify(content: string | CSLResult | ISLResult): Promise<CPEResult>`

**Descripción**: Ejecuta el pipeline completo CSL → ISL → CPE del core.

**Flujo interno**:
1. Si es string, ejecuta `scanPrompt()`
2. Si es `CSLResult`, ejecuta `sanitize()` del core
3. Invoca `envelope()` del core
4. Retorna `CPEResult` del core

**Ejemplo**:
```typescript
const cslResult = await pip.scanDOM()
const cpeResult = await pip.purify(cslResult)
// cpeResult es un CPEResult del core, con envelope estructurado
```

### 4.3 Funciones Operativas

Estas funciones interpretan señales del core y ejecutan acciones operativas:

#### `report(result: CSLResult | ISLResult | CPEResult): void`

**Descripción**: Genera reportes operativos basados en los resultados del core.

**Nota**: Esta función es puramente operativa del SDK. El core no genera reportes, solo produce estructuras de datos.

#### `lock(action: string, reason?: string): boolean`

**Descripción**: Ejecuta una acción local según la política configurada.

**⚠️ Importante**: `lock()` **NO pertenece al protocolo AI-PIP**. Es una acción operativa del SDK que puede bloquear acciones en el entorno (navegador, servidor, etc.) según las señales interpretadas del core.

**Ejemplo**:
```typescript
const result = await pip.scanDOM()
if (result.segments.some(s => isUntrusted(s.trust))) {
  // Esta decisión es del SDK, no del core
  pip.lock('navigation', 'Untrusted content detected')
}
```

---

## 5. Funciones del SDK

### 5.1 Funciones de Hash y Criptografía

Estas funciones implementan operaciones criptográficas que el core define pero no implementa:

#### `hashContent(content: string, algorithm?: HashAlgorithm): ContentHash`

Genera hash criptográfico del contenido. El core define el tipo `ContentHash`, el SDK implementa la generación.

#### `verifyContentHash(content: string, hash: ContentHash): boolean`

Verifica si un hash corresponde a un contenido.

#### `verifySignature(content: string, signature: string, secretKey: string): boolean`

Verifica una firma criptográfica. El core define la estructura del envelope, el SDK implementa la verificación.

### 5.2 Funciones de Detección

Estas funciones implementan heurísticas que el core no contiene:

#### `detectMimeType(content: string): string`

Detecta el tipo MIME del contenido usando heurísticas deterministas.

#### `normalizeBasic(content: string): string`

Aplica normalización básica al contenido.

#### `segmentSemantic(content: string, source: Source): string[]`

Segmenta contenido de manera semántica avanzada.

### 5.3 Funciones de Decisión

Estas funciones interpretan señales del core y toman decisiones:

#### `shouldBlock(result: PiDetectionResult): boolean`

Determina si se debe bloquear basado en el resultado de detección del core.

**Nota**: El core produce `PiDetectionResult` con señales. El SDK interpreta estas señales y decide acciones.

#### `shouldWarn(result: PiDetectionResult): boolean`

Determina si se debe advertir basado en el resultado.

### 5.4 Funciones de Serialización

Estas funciones implementan serialización que el core define pero no implementa:

#### `serializeContent(segments: readonly ISLSegment[]): string`

Serializa contenido sanitizado para firma.

#### `serializeMetadata(metadata: CPEMetadata): string`

Serializa metadata para firma.

#### `generateSignableContent(content: string, metadata: string, algorithm: string): string`

Genera contenido completo para firma.

### 5.5 Funciones de Auditoría

Estas funciones analizan el linaje para observabilidad:

#### `getLineageStats(lineage: readonly LineageEntry[]): {...}`

Obtiene estadísticas del linaje.

#### `getLineageByStep(lineage: readonly LineageEntry[], step: string): readonly LineageEntry[]`

Filtra linaje por step.

#### `getLineageByTimeRange(...)`, `getLineageByNotes(...)`, etc.

Funciones de análisis del linaje para auditoría operativa.

---

## 6. Tipos TypeScript

### 6.1 Tipos del Core (Re-exportados)

El SDK re-exporta todos los tipos del core semántico:

```typescript
// Tipos del core (re-exportados)
import type {
  // CSL
  CSLInput,
  CSLResult,
  CSLSegment,
  TrustLevel,
  Origin,
  LineageEntry,
  ContentHash,
  
  // ISL
  ISLResult,
  ISLSegment,
  PiDetection,
  PiDetectionResult,
  AnomalyScore,
  Pattern,
  
  // CPE
  CPEResult,
  CPEEvelope,
  CPEMetadata,
  Nonce,
  SignatureVO,
  
  // Value Objects
  TrustLevelType,
  OriginType,
  HashAlgorithm,
  Source,
  RiskScore,
  AnomalyAction
} from '@ai-pip/sdk'
```

### 6.2 Tipos del SDK (Propios)

El SDK define tipos adicionales para operaciones propias:

```typescript
// Tipos del SDK (propios)
interface RiskEvent {
  readonly level: 'low' | 'medium' | 'high'
  readonly reason: string
  readonly timestamp: number
  readonly source: 'CSL' | 'ISL' | 'CPE'
  readonly metadata?: Record<string, unknown>
}

interface SDKOptions {
  readonly enablePolicyValidation?: boolean
  readonly enableLineageTracking?: boolean
  readonly hashAlgorithm?: 'sha256' | 'sha512'
  readonly secretKey?: string
  readonly onRiskDetected?: (event: RiskEvent) => void
}

interface LockResult {
  readonly success: boolean
  readonly action: string
  readonly reason?: string
  readonly timestamp: number
}

interface RuntimeDecision {
  readonly action: 'ALLOW' | 'WARN' | 'BLOCK'
  readonly reason: string
  readonly confidence: number
  readonly source: 'policy' | 'heuristic' | 'core-signal'
}
```

**Aclaración importante**: El SDK puede enriquecer los resultados del core con metadata operacional (timestamps, decisiones runtime, eventos), pero estos tipos no forman parte del protocolo semántico.

---

## 7. Ejemplos de Uso

### 7.1 Uso Básico en Navegador

```typescript
import { scanDOM, purify, onRiskDetected } from '@ai-pip/sdk'

// Escanear DOM
const cslResult = await scanDOM(document.body)

// Ejecutar pipeline completo
const cpeResult = await purify(cslResult)

// Escuchar eventos de riesgo (generados por el SDK)
onRiskDetected((event) => {
  console.log('Riesgo detectado:', event.level, event.reason)
})
```

### 7.2 Uso con Core Directo

```typescript
import { segment, sanitize, envelope } from '@ai-pip/core'
import { hashContent, verifySignature } from '@ai-pip/sdk'

// Usar core directamente
const cslResult = segment({ content: '...', source: 'UI' })
const islResult = sanitize(cslResult)
const cpeResult = envelope(islResult, secretKey)

// Usar funciones del SDK para operaciones adicionales
const hash = hashContent(cslResult.segments[0].content)
const isValid = verifySignature(signableContent, cpeResult.envelope.signature.value, secretKey)
```

### 7.3 Integración con React

```typescript
import { useEffect, useState } from 'react'
import { scanDOM, onRiskDetected } from '@ai-pip/sdk'

function useAIPIPProtection() {
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | null>(null)
  
  useEffect(() => {
    const handleRisk = (event: RiskEvent) => {
      setRiskLevel(event.level)
    }
    
    onRiskDetected(handleRisk)
    
    // Escanear DOM periódicamente
    const interval = setInterval(async () => {
      await scanDOM()
    }, 5000)
    
    return () => {
      clearInterval(interval)
    }
  }, [])
  
  return riskLevel
}
```

### 7.4 Integración en Node.js

```typescript
import { scanPrompt, purify } from '@ai-pip/sdk'

async function processUserInput(prompt: string) {
  // Procesar prompt
  const islResult = await scanPrompt(prompt)
  
  // Ejecutar pipeline completo
  const cpeResult = await purify(islResult)
  
  // El SDK puede enriquecer con metadata operacional
  return {
    ...cpeResult, // Resultado del core
    processedAt: Date.now(), // Metadata del SDK
    environment: 'node' // Metadata del SDK
  }
}
```

---

## 8. Integración

### 8.1 Integración con Navegadores

El SDK proporciona adaptadores para navegadores:

```typescript
import { DOMAdapter } from '@ai-pip/sdk/adapters'

const adapter = new DOMAdapter({
  enableHiddenContentDetection: true,
  enableMimeDetection: true
})

const content = adapter.extractContent(document.body)
const cslResult = segment({ content, source: 'DOM' })
```

### 8.2 Integración con Node.js

```typescript
import { SystemTimestampProvider, CryptoHashGenerator } from '@ai-pip/sdk/adapters'

const timestampProvider = new SystemTimestampProvider()
const hashGenerator = new CryptoHashGenerator('sha256')

// Usar con el core
const lineage = createLineageEntry('CSL', timestampProvider.now())
const hash = hashGenerator.generate(content)
```

### 8.3 Integración con Edge Computing

El SDK puede ejecutarse en entornos edge:

```typescript
import { segment, sanitize } from '@ai-pip/core'
import { serializeContent } from '@ai-pip/sdk'

// Ejecutar core en edge
const cslResult = segment({ content: '...', source: 'API' })
const islResult = sanitize(cslResult)

// Serializar para transmisión
const serialized = serializeContent(islResult.segments)
```

---

## 9. Configuración

### 9.1 Configuración del SDK

```typescript
import { configure } from '@ai-pip/sdk'

configure({
  enablePolicyValidation: true,
  enableLineageTracking: true,
  hashAlgorithm: 'sha256',
  secretKey: process.env.AI_PIP_SECRET_KEY,
  onRiskDetected: (event) => {
    // Manejar eventos de riesgo
    console.log('Risk detected:', event)
  }
})
```

### 9.2 Políticas Operativas

El SDK permite configurar políticas que interpretan señales del core:

```typescript
interface PolicyConfig {
  // Niveles de TrustLevel que deben bloquearse
  blockUntrusted: boolean
  blockSemiTrusted: boolean
  
  // Scores de anomalía que deben bloquearse
  blockHighRisk: boolean
  warnMediumRisk: boolean
  
  // Acciones a tomar
  onBlock: (reason: string) => void
  onWarn: (reason: string) => void
}
```

**Nota**: Estas políticas son del SDK, no del protocolo. El protocolo solo produce señales.

---

## 10. Eventos y Callbacks

### 10.1 Eventos del SDK

**Importante**: El core semántico **NO emite eventos**. Los eventos son generados por el SDK cuando interpreta los resultados del core.

#### `onRiskDetected(callback: (risk: RiskEvent) => void): void`

Registra un callback que se ejecuta cuando el SDK interpreta un riesgo basado en señales del core.

**Ejemplo**:
```typescript
onRiskDetected((event) => {
  // Este evento es generado por el SDK, no por el core
  if (event.level === 'high') {
    // Acción operativa del SDK
    lock('navigation', event.reason)
  }
})
```

#### `offRiskDetected(callback: (risk: RiskEvent) => void): void`

Desregistra un callback de eventos.

### 10.2 Interpretación de Señales

El SDK interpreta señales del core y genera eventos:

```typescript
// Core produce señales
const islResult = sanitize(cslResult)
const hasHighRisk = islResult.segments.some(s => 
  s.piDetection && isHighRisk(s.piDetection.confidence)
)

// SDK interpreta y genera evento
if (hasHighRisk) {
  emitRiskEvent({
    level: 'high',
    reason: 'High confidence PI detection',
    source: 'ISL',
    timestamp: Date.now()
  })
}
```

---

## 11. Mejores Prácticas

### 11.1 Separación Core/SDK

- ✅ Usa el core directamente cuando necesites funciones puras
- ✅ Usa el SDK cuando necesites adaptación a entornos específicos
- ✅ No mezcles responsabilidades: el core produce señales, el SDK ejecuta acciones

### 11.2 Manejo de Errores

```typescript
try {
  const result = await scanDOM()
  // Procesar resultado del core
} catch (error) {
  if (error instanceof SegmentationError) {
    // Error del core
  } else {
    // Error del SDK o entorno
  }
}
```

### 11.3 Performance

- El core es optimizado para bajo overhead
- El rendimiento depende del entorno de ejecución
- Usa funciones del SDK solo cuando necesites adaptación específica

---

## 12. Conclusión

El SDK de AI-PIP es una capa de integración que:

- ✅ Consume el core semántico (`@ai-pip/core`)
- ✅ Adapta el core a entornos concretos
- ✅ Interpreta señales del core y ejecuta acciones operativas
- ✅ Proporciona utilidades y helpers para facilitar el uso

**El SDK NO**:
- ❌ Define la lógica de seguridad (eso es el core)
- ❌ Es el protocolo (es una implementación de referencia)
- ❌ Reemplaza al core (lo complementa)

Para entender el protocolo semántico, consultar: [Core Semántico](./core-semantic.md)  
Para entender la arquitectura, consultar: [Arquitectura Semántica](./architecture.md)

---

**Versión del Documento**: 2.0  
**Última Actualización**: 2025  
**Autor**: Felipe Masliah  
**Licencia**: Apache-2.0

---

*Este documento describe el SDK de referencia. Para entender el protocolo semántico formal, consultar la documentación del core.*
