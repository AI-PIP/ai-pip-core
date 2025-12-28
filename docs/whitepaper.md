# AI Prompt Integrity Protocol (AI-PIP)
## A Semantic Protocol for Secure AI Prompt Processing

**Versión**: 2.0  
**Autor**: Felipe Masliah  
**Licencia**: Apache-2.0  
**Idioma**: Español (con terminología técnica en inglés)  
**Estado**: Protocolo Semántico Formal

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Introducción](#2-introducción)
3. [Contexto y Problemática](#3-contexto-y-problemática)
4. [Estado del Arte](#4-estado-del-arte)
5. [Definición del Protocolo AI-PIP](#5-definición-del-protocolo-ai-pip)
   - [5.1 Protocolo Semántico vs Implementación](#51-protocolo-semántico-vs-implementación)
   - [5.2 Core Semántico](#52-core-semántico)
   - [5.3 SDK de Referencia](#53-sdk-de-referencia)
6. [Arquitectura Semántica del Protocolo](#6-arquitectura-semántica-del-protocolo)
   - [6.1 Principios Fundamentales](#61-principios-fundamentales)
   - [6.2 Capas del Protocolo](#62-capas-del-protocolo)
   - [6.3 Contratos Semánticos entre Capas](#63-contratos-semánticos-entre-capas)
7. [Flujo de Procesamiento Semántico](#7-flujo-de-procesamiento-semántico)
8. [Garantías del Protocolo](#8-garantías-del-protocolo)
9. [Ventajas y Propiedades del Protocolo](#9-ventajas-y-propiedades-del-protocolo)
10. [Limitaciones y Trabajo Futuro](#10-limitaciones-y-trabajo-futuro)
11. [Conclusión](#11-conclusión)
12. [Referencias](#12-referencias)

---

## 1. Resumen Ejecutivo

**AI-PIP (AI Prompt Integrity Protocol)** es un protocolo semántico formal diseñado para garantizar la integridad, autenticidad y trazabilidad de prompts antes de su procesamiento por modelos de lenguaje. A diferencia de soluciones implementacionales, AI-PIP se define como un **protocolo abstracto** independiente de su implementación concreta.

### Principios Fundamentales

1. **AI-PIP es un protocolo semántico, no un software**: El protocolo define estructuras semánticas, señales de riesgo y contratos entre capas. El software es solo una implementación posible.

2. **Separación Core Semántico / SDK**: 
   - **Core Semántico**: Funciones puras, deterministas, sin efectos secundarios que definen **qué** hace el protocolo
   - **SDK**: Implementación de referencia que define **cómo** usar el protocolo en entornos concretos

3. **El protocolo produce señales, no ejecuta acciones**: El core semántico emite señales de riesgo, recomendaciones y estructuras de datos. Las decisiones de bloqueo, validación y ejecución pertenecen a la implementación (SDK).

### Objetivo Principal

Garantizar la integridad semántica y autenticidad del prompt mediante un pipeline de procesamiento que segmenta, clasifica, sanitiza y encapsula contenido antes de su procesamiento por modelos de lenguaje.

---

## 2. Introducción

La integración de agentes de inteligencia artificial en navegadores web ha transformado la interacción humano-computadora, pero ha introducido vulnerabilidades críticas relacionadas con la integridad de los prompts. Los modelos de lenguaje procesan contenido sin capacidad nativa para distinguir entre instrucciones legítimas del usuario y contenido manipulado o malicioso inyectado en el contexto.

**AI-PIP** aborda esta necesidad mediante la definición de un protocolo semántico formal que establece las condiciones bajo las cuales un prompt puede ser considerado válido para procesamiento. El protocolo no es un software específico, sino una especificación abstracta que puede ser implementada en diferentes entornos (navegadores, servidores, edge computing).

### Características Clave

- **Protocolo Semántico Formal**: Define estructuras de datos, funciones puras y contratos entre componentes
- **Independiente de Implementación**: El protocolo puede ejecutarse offline, sin dependencias de runtime específicas
- **Composición Funcional**: Cada capa del protocolo es una función pura que transforma datos inmutables
- **Trazabilidad Completa**: El protocolo preserva un linaje completo de todas las transformaciones aplicadas

---

## 3. Contexto y Problemática

### 3.1 Problemas Identificados

La interacción con modelos de lenguaje en navegadores presenta vulnerabilidades específicas:

1. **Texto Oculto en Páginas Web**: Contenido invisible o manipulado que puede ser inyectado en prompts sin conocimiento del usuario
2. **Manipulación de Prompts**: Modificación maliciosa de instrucciones durante la transmisión o procesamiento
3. **Falta de Trazabilidad**: Ausencia de mecanismos estándar para verificar el origen y autenticidad del contenido procesado
4. **Vulnerabilidades Semánticas**: Ataques basados en ingeniería social y jailbreaks que explotan la interpretación del modelo

### 3.2 Necesidad de un Protocolo Formal

Estos problemas requieren un enfoque sistemático que garantice la integridad del prompt desde su origen hasta su procesamiento. Sin embargo, las soluciones actuales se enfocan en implementaciones específicas sin definir un protocolo abstracto reutilizable.

**AI-PIP** propone la primera especificación formal de un protocolo de integridad de prompts, independiente de su implementación concreta.

---

## 4. Estado del Arte

El estado del arte en seguridad aplicada a interacción con modelos de lenguaje dentro del navegador **no cuenta con un protocolo formal** previo al procesamiento del prompt. La investigación actual está dividida en cuatro enfoques principales:

### 4.1 Filtering Heurístico

Basado en listas de palabras bloqueadas o expresiones regulares.

**Limitaciones**: Fácil de evadir, no considera semántica, no es un protocolo formal.

### 4.2 Self-Guarding con LLM

El modelo evalúa su propio prompt ("¿Es esta instrucción maliciosa?").

**Limitaciones**: Vulnerable a jailbreaks y role hijacking, requiere acceso al modelo.

### 4.3 Sandboxing Parcial del Contexto

Algunas extensiones intentan separar texto visible del oculto.

**Limitaciones**: Sin garantías criptográficas, sin autenticación de origen, implementación específica.

### 4.4 Aislamiento mediante Proxies de IA

Empresas implementan middleware privado para limpieza de datos.

**Limitaciones**: No es un estándar, no interoperable, usualmente propietario.

### 4.5 Conclusión del Estado del Arte

> **Hoy no existe un mecanismo estandarizado que verifique integridad, autenticidad y semántica del texto ANTES de llegar al modelo de IA mediante un protocolo formal independiente de implementación.**

Esto valida la necesidad del protocolo AI-PIP como **primer estándar abierto** de integridad de prompts definido como protocolo semántico formal.

---

## 5. Definición del Protocolo AI-PIP

### 5.1 Protocolo Semántico vs Implementación

**AI-PIP no es un software, es un protocolo semántico. El software es solo una implementación posible.**

El protocolo AI-PIP se define mediante:

- **Estructuras Semánticas**: Tipos de datos inmutables que representan el estado del procesamiento
- **Funciones Puras**: Transformaciones deterministas sin efectos secundarios
- **Contratos entre Capas**: Especificaciones formales de las interfaces entre componentes
- **Reglas de Composición**: Cómo las capas se combinan para formar el pipeline completo

El SDK (Software Development Kit) implementa:

- **Bloqueos y Políticas**: Decisiones operativas basadas en las señales del protocolo
- **Criptografía Real**: Implementación concreta de algoritmos de firma y verificación
- **Serialización**: Formato específico para transmisión y almacenamiento
- **Integración con Entornos**: Adaptadores para navegadores, Node.js, edge computing

### 5.2 Core Semántico

El core semántico de AI-PIP está compuesto exclusivamente por:

#### Funciones Puras

Funciones que, dado el mismo input, siempre producen el mismo output y no tienen efectos secundarios:

- `segment(input: CSLInput): CSLResult` - Segmenta y clasifica contenido
- `sanitize(cslResult: CSLResult): ISLResult` - Produce señales de sanitización
- `envelope(islResult: ISLResult, secretKey: string): CPEResult` - Define estructura del envelope

#### Value Objects Inmutables

Tipos de datos definidos por su valor, sin identidad:

- `TrustLevel` - Nivel de confianza (TC, STC, UC)
- `Origin` - Origen del contenido (DOM, UI, SYSTEM, API)
- `LineageEntry` - Entrada de linaje (step, timestamp)
- `PiDetection` - Detección de prompt injection
- `AnomalyScore` - Score de anomalía

#### Contratos Semánticos

Especificaciones formales de las interfaces entre capas:

- **CSL → ISL**: `CSLResult` con segmentos clasificados
- **ISL → CPE**: `ISLResult` con contenido sanitizado y señales
- **CPE → ModelGateway**: `CPEResult` con envelope estructurado

#### Lo que NO es Core

El core semántico **NO** contiene:

- ❌ Funciones que "deciden" (shouldBlock, shouldWarn) → SDK/ModelGateway
- ❌ Funciones que "detectan riesgo" mediante heurísticas avanzadas → SDK
- ❌ Funciones que "normalizan agresivamente" → SDK/ISL
- ❌ Funciones que "serializan" → SDK
- ❌ Funciones que "verifican" criptográficamente → SDK
- ❌ Funciones de "auditoría" y análisis → SDK/tooling

### 5.3 SDK de Referencia

El SDK proporciona una implementación de referencia del protocolo que incluye:

#### Funciones de Implementación

- **Hash y Criptografía**: `hashContent()`, `verifyContentHash()`, `verifySignature()`
- **Detección**: `detectMimeType()`, `normalizeBasic()`, `segmentSemantic()`
- **Decisiones**: `shouldBlock()`, `shouldWarn()`, políticas de acceso
- **Serialización**: `serializeContent()`, `serializeMetadata()`
- **Auditoría**: `getLineageStats()`, `getLineageByNotes()`

#### Adapters

- `DOMAdapter` - Adaptador para DOM del navegador
- `UIAdapter` - Adaptador para interfaces de usuario
- `CryptoHashGenerator` - Generador de hash criptográfico
- `SystemTimestampProvider` - Proveedor de timestamps

#### Factory Functions

Funciones que facilitan el uso del protocolo en entornos concretos:

```typescript
const service = createCSLService({
  enablePolicyValidation: true,
  enableLineageTracking: true,
  hashAlgorithm: 'sha256'
})
```

---

## 6. Arquitectura Semántica del Protocolo

### 6.1 Principios Fundamentales

#### Principio 1: Separación Semántica

El protocolo define **qué** debe ocurrir; el SDK define **cómo** ocurre.

#### Principio 2: Funciones Puras

Todas las funciones del core son puras, deterministas y sin efectos secundarios. El mismo input siempre produce el mismo output.

#### Principio 3: Inmutabilidad

Todas las estructuras de datos son inmutables. Las transformaciones producen nuevas estructuras, nunca modifican las existentes.

#### Principio 4: Composición

El pipeline completo se construye mediante composición de funciones puras:

```
CSLResult = segment(CSLInput)
ISLResult = sanitize(CSLResult)
CPEResult = envelope(ISLResult, secretKey)
```

#### Principio 5: Señales, no Acciones

El protocolo produce señales (TrustLevel, AnomalyScore, PiDetection), no ejecuta acciones (bloqueos, validaciones). Las acciones pertenecen al SDK.

### 6.2 Capas del Protocolo

El protocolo AI-PIP consta de cinco capas principales que procesan el contenido de forma secuencial:

#### 6.2.1 CSL: Context Segmentation Layer

**Rol Semántico (Core)**:
- Segmenta contenido en unidades estructurales
- Clasifica origen del contenido (Source → TrustLevel)
- Inicializa linaje para trazabilidad
- Produce estructuras de datos inmutables

**Rol Operativo (SDK)**:
- Lee DOM del navegador
- Detecta contenido oculto
- Aplica heurísticas de detección MIME
- Genera hashes criptográficos

**Funciones Core**:
- `segment(input: CSLInput): CSLResult`
- `classifySource(source: Source): TrustLevel`
- `classifyOrigin(origin: Origin): TrustLevel`
- `initLineage(segment: CSLSegment): LineageEntry[]`

**Output Semántico**:
- Segmentos clasificados por nivel de confianza (TC, STC, UC)
- Linaje inicializado
- Estructura inmutable `CSLResult`

#### 6.2.2 ISL: Instruction Sanitization Layer

**Rol Semántico (Core)**:
- Produce señales de sanitización según TrustLevel
- Detecta patrones de prompt injection
- Calcula scores de anomalía
- Emite señales de riesgo (no decide acciones)

**Rol Operativo (SDK)**:
- Aplica normalización agresiva
- Implementa políticas de bloqueo
- Decide acciones finales (ALLOW/WARN/BLOCK)
- Serializa contenido sanitizado

**Funciones Core**:
- `sanitize(cslResult: CSLResult): ISLResult`
- `createPiDetection(...): PiDetection`
- `createAnomalyScore(...): AnomalyScore`
- `createPattern(...): Pattern`

**Output Semántico**:
- Contenido sanitizado con señales de riesgo
- Detecciones de prompt injection
- Scores de anomalía
- Estructura inmutable `ISLResult`

#### 6.2.3 CPE: Cryptographic Prompt Envelope

**Rol Semántico (Core)**:
- Define estructura del envelope criptográfico
- Genera metadata de seguridad (timestamp, nonce, versión)
- Establece contrato de firma (no implementa firma)
- Preserva linaje completo

**Rol Operativo (SDK)**:
- Implementa algoritmos criptográficos (HMAC-SHA256)
- Serializa contenido para firma
- Verifica firmas
- Valida formato de signatures

**Funciones Core**:
- `envelope(islResult: ISLResult, secretKey: string): CPEResult`
- `createMetadata(...): CPEMetadata`
- `createNonce(...): Nonce`
- `createSignature(...): SignatureVO`

**Output Semántico**:
- Estructura del envelope con payload, metadata, signature
- Linaje completo preservado
- Estructura inmutable `CPEResult`

#### 6.2.4 AAL: Agent Action Lock

**Rol Semántico (Core)**:
- Define señales de alineación de acciones
- Produce recomendaciones semánticas sobre acciones permitidas

**Rol Operativo (SDK)**:
- Implementa locks de acciones
- Bloquea navegación cuando es necesario
- Previene lectura de contenido riesgoso

**Estado**: En diseño

#### 6.2.5 ModelGateway

**Rol Semántico (Core)**:
- Evalúa señales de CSL, ISL, CPE, AAL
- Produce recomendación semántica (ALLOW/BLOCK/WARN)

**Rol Operativo (SDK)**:
- Aplica políticas de acceso
- Verifica firmas criptográficas
- Decide acciones finales
- Enruta al proveedor de IA

**Estado**: En diseño

### 6.3 Contratos Semánticos entre Capas

Los contratos definidos son **contratos semánticos**, no implementaciones técnicas. Especifican las estructuras de datos que fluyen entre capas:

#### Contrato CSL → ISL

**Input**: `CSLResult`
- Segmentos clasificados por TrustLevel
- Linaje inicializado
- Estructura inmutable

**Output**: `ISLResult`
- Contenido sanitizado
- Señales de riesgo (PiDetection, AnomalyScore)
- Linaje extendido

#### Contrato ISL → CPE

**Input**: `ISLResult`
- Contenido sanitizado
- Señales de sanitización aplicada
- Linaje completo

**Output**: `CPEResult`
- Envelope con payload, metadata, signature
- Linaje preservado

#### Contrato CPE → ModelGateway

**Input**: `CPEResult`
- Envelope criptográfico estructurado
- Metadata de seguridad
- Linaje completo

**Output**: Recomendación semántica (ALLOW/BLOCK/WARN)

---

## 7. Flujo de Procesamiento Semántico

El protocolo procesa contenido mediante un pipeline funcional puro:

```
┌─────────────────────────────────────────────────────────┐
│                    CORE SEMÁNTICO                        │
│                                                          │
│  CSLInput                                               │
│    │                                                     │
│    ▼                                                     │
│  segment() → CSLResult                                  │
│    │                                                     │
│    ▼                                                     │
│  sanitize() → ISLResult                                 │
│    │                                                     │
│    ▼                                                     │
│  envelope() → CPEResult                                 │
│    │                                                     │
│    ▼                                                     │
│  Señales Semánticas                                      │
└───────────────────┬─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────┐
│                    SDK / IMPLEMENTACIÓN                  │
│                                                          │
│  - Lee DOM                                               │
│  - Genera hashes                                         │
│  - Serializa contenido                                   │
│  - Verifica firmas                                       │
│  - Decide acciones (ALLOW/BLOCK/WARN)                     │
│  - Bloquea si es necesario                               │
└─────────────────────────────────────────────────────────┘
```

### Características del Flujo

1. **Determinista**: El mismo input siempre produce el mismo output
2. **Componible**: Cada capa es una función pura que puede ejecutarse independientemente
3. **Offline**: El pipeline semántico puede ejecutarse sin conexión a internet
4. **Testeable**: Cada función puede ser testeada de forma aislada

---

## 8. Garantías del Protocolo

### 8.1 Garantía de Integridad Semántica

El protocolo garantiza que todo contenido procesado:

- Ha sido segmentado y clasificado por origen
- Ha sido evaluado mediante señales de sanitización
- Incluye metadata de seguridad estructurada
- Preserva linaje completo para trazabilidad

### 8.2 Garantía de Determinismo

Todas las funciones del core son deterministas:

- Mismo input → mismo output
- Sin dependencias de estado externo
- Sin efectos secundarios
- Ejecutable en cualquier orden

### 8.3 Garantía de Inmutabilidad

Todas las estructuras de datos son inmutables:

- No se modifican después de su creación
- Las transformaciones producen nuevas estructuras
- Thread-safe por diseño
- Predecible y seguro

### 8.4 Garantía de Composición

El pipeline completo se construye mediante composición:

- Cada capa es independiente
- Puede ejecutarse de forma aislada
- Fácil de testear y verificar
- Extensible sin modificar código existente

---

## 9. Ventajas y Propiedades del Protocolo

### 9.1 Propiedades Técnicas

| Propiedad | Descripción |
|-----------|-------------|
| **Independencia de Proveedor** | El protocolo funciona con cualquier proveedor de IA (OpenAI, Google, Anthropic, Local LLM) |
| **Prevención Basada en Estructura** | No depende solo de heurísticas, sino de clasificación semántica |
| **Seguridad Criptográfica** | Define estructuras que garantizan integridad del mensaje |
| **Bajo Overhead** | Procesamiento en milisegundos, ejecutable offline |
| **Extensibilidad** | Arquitectura modular permite agregar nuevas capas |

### 9.2 Ventajas Académicas

1. **Protocolo Formal**: Definición matemática precisa mediante funciones puras
2. **Verificable**: Cada componente puede ser verificado formalmente
3. **Componible**: Arquitectura funcional permite razonamiento composicional
4. **Independiente de Implementación**: El protocolo puede ser implementado en diferentes entornos

### 9.3 Ventajas Prácticas

1. **Reutilizable**: El core semántico puede usarse en diferentes contextos
2. **Testeable**: Funciones puras facilitan testing exhaustivo
3. **Mantenible**: Separación clara entre protocolo e implementación
4. **Escalable**: Arquitectura modular permite crecimiento incremental

---

## 10. Limitaciones y Trabajo Futuro

### 10.1 Limitaciones Actuales

1. **Detección de Ingeniería Social**: El protocolo no detecta 100% de ataques basados en ingeniería social
2. **Adopción de la Industria**: El protocolo requiere adopción para convertirse en estándar
3. **Compatibilidad con Gateways**: CPE requiere compatibilidad explícita en gateways de IA

### 10.2 Trabajo Futuro

#### Capas Planificadas

- **SRL (Semantic Review Layer)**: Revisión semántica avanzada
- **SPL (Secure Policy Layer)**: Capa de políticas de seguridad

#### Mejoras del Protocolo

- Extensión de contratos semánticos
- Nuevos tipos de señales de riesgo
- Mejoras en trazabilidad

Para información detallada sobre el roadmap, consultar: [Roadmap](./roadmap.md)

---

## 11. Conclusión

AI-PIP propone el **primer protocolo semántico formal** para seguridad de prompts en navegadores, definido como especificación abstracta independiente de su implementación.

### Contribuciones Principales

1. **Protocolo Semántico Formal**: Primera especificación abstracta de integridad de prompts
2. **Separación Core/SDK**: Distinción clara entre protocolo e implementación
3. **Arquitectura Funcional**: Pipeline compuesto por funciones puras y deterministas
4. **Trazabilidad Completa**: Linaje preservado en todas las transformaciones

### Impacto Esperado

Este trabajo abre el camino para:

- ✅ Navegación asistida por IA segura
- ✅ Compatibilidad con ecosistema de agentes
- ✅ Marco académico y profesional para seguridad LLM
- ✅ Estándar abierto e interoperable

### Frase Clave

> **AI-PIP no es un software, es un protocolo semántico. El software es solo una implementación posible.**

---

## 12. Referencias

### Documentación del Protocolo

- [Core Semántico](./core-semantic.md) - Especificación del core puro
- [SDK Reference](./sdk-reference.md) - Guía del SDK de implementación
- [Arquitectura Semántica](./architecture.md) - Arquitectura detallada del protocolo
- [Especificaciones de Capas](./layer/) - Documentación de cada capa

### Implementación

- [Repositorio Core](https://github.com/ai-pip/ai-pip-core) - Implementación del core semántico
- [Repositorio SDK](https://github.com/AI-PIP/ai-pip-sdk-ts) - SDK de referencia TypeScript

### Roadmap

- [Roadmap](./roadmap.md) - Plan de desarrollo y mejoras futuras

---

**Versión del Documento**: 2.0  
**Última Actualización**: 2025  
**Autor**: Felipe Masliah  
**Licencia**: Apache-2.0

---

*Este documento define el protocolo AI-PIP como especificación semántica formal. Para implementaciones concretas, consultar la documentación del SDK.*

