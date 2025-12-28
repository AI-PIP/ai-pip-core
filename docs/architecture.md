# Arquitectura Semántica del Protocolo AI-PIP

> Documento de arquitectura del protocolo AI Prompt Integrity Protocol (AI-PIP)
> 
> Este documento describe la arquitectura semántica del protocolo, no una implementación concreta.

**Versión**: 2.0  
**Autor**: Felipe Masliah  
**Última Actualización**: 2025

---

## 📋 Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Separación Protocolo vs Implementación](#2-separación-protocolo-vs-implementación)
3. [Principios Fundamentales](#3-principios-fundamentales)
4. [Flujo del Protocolo](#4-flujo-del-protocolo)
   - [4.1 Pipeline de Procesamiento Semántico](#41-pipeline-de-procesamiento-semántico)
   - [4.2 Principio de Fail-Secure](#42-principio-de-fail-secure)
5. [Capas del Protocolo](#5-capas-del-protocolo)
   - [5.1 CSL: Context Segmentation Layer](#51-csl-context-segmentation-layer)
   - [5.2 ISL: Instruction Sanitization Layer](#52-isl-instruction-sanitization-layer)
   - [5.3 CPE: Cryptographic Prompt Envelope](#53-cpe-cryptographic-prompt-envelope)
   - [5.4 ModelGateway: Infraestructura de Despliegue](#54-modelgateway-infraestructura-de-despliegue)
6. [Contratos Semánticos entre Capas](#6-contratos-semánticos-entre-capas)
   - [6.1 Contrato CSL → ISL](#61-contrato-csl--isl)
   - [6.2 Contrato ISL → CPE](#62-contrato-isl--cpe)
   - [6.3 Contrato CPE → ModelGateway](#63-contrato-cpe--modelgateway)
7. [Garantías del Protocolo](#7-garantías-del-protocolo)
   - [7.1 Garantía de Integridad Semántica](#71-garantía-de-integridad-semántica)
   - [7.2 Garantía de Trazabilidad](#72-garantía-de-trazabilidad)
   - [7.3 Garantía de Composición](#73-garantía-de-composición)
8. [Principios de Diseño](#8-principios-de-diseño)
9. [Conclusión](#9-conclusión)

---

## 1. Introducción

Este documento describe la **arquitectura semántica** del protocolo AI-PIP. El protocolo se define como una especificación abstracta compuesta por funciones puras, estructuras de datos inmutables y contratos semánticos entre componentes.

**Importante**: Este documento describe **qué** debe cumplir el protocolo, no **cómo** se implementa. Los detalles de implementación (normalización, detección heurística, hashing, políticas, serialización) son responsabilidad del SDK o de implementaciones específicas.

---

## 2. Separación Protocolo vs Implementación

### 2.1 Principio Fundamental

> **El protocolo define contratos semánticos. El SDK implementa mecanismos.**

El presente documento describe la arquitectura del protocolo AI-PIP, no una implementación concreta. Las funciones descritas en cada capa representan **contratos semánticos** que deben cumplirse. Los detalles de implementación (normalización, detección heurística, hashing, políticas, serialización) no forman parte del core del protocolo y son responsabilidad del SDK o de implementaciones específicas.

### 2.2 Responsabilidades del Protocolo (Core Semántico)

El protocolo define:

- ✅ **Estructuras Semánticas**: Tipos de datos inmutables que representan el estado del procesamiento
- ✅ **Funciones Puras**: Transformaciones deterministas sin efectos secundarios
- ✅ **Contratos entre Capas**: Especificaciones formales de las interfaces entre componentes
- ✅ **Señales de Riesgo**: Estructuras que describen condiciones semánticas (TrustLevel, AnomalyScore, PiDetection)
- ✅ **Reglas de Composición**: Cómo las capas se combinan para formar el pipeline completo

### 2.3 Responsabilidades de la Implementación (SDK)

La implementación proporciona:

- ❌ **Normalización**: Eliminación de caracteres invisibles, normalización Unicode
- ❌ **Detección Heurística**: Identificación de patrones mediante heurísticas
- ❌ **Hashing Criptográfico**: Generación de hashes SHA-256/SHA-512
- ❌ **Políticas y Decisiones**: Aplicación de reglas de bloqueo, validación de acceso
- ❌ **Serialización**: Formato específico para transmisión y almacenamiento
- ❌ **Verificación Criptográfica**: Validación de firmas y integridad

### 2.4 Relación Core / SDK

```
┌─────────────────────────────────────┐
│      Core Semántico (Protocolo)     │
│  - Define estructuras               │
│  - Define funciones puras           │
│  - Define contratos                 │
│  - Produce señales                  │
└──────────────┬──────────────────────┘
               │ usado por
               ▼
┌─────────────────────────────────────┐
│      SDK (Implementación)           │
│  - Implementa normalización          │
│  - Implementa detección             │
│  - Implementa hashing               │
│  - Implementa políticas             │
│  - Ejecuta acciones                 │
└─────────────────────────────────────┘
```

---

## 3. Principios Fundamentales

### 3.1 Protocolo Semántico Formal

AI-PIP es un protocolo semántico formal definido mediante:

- **Funciones Puras**: Sin efectos secundarios, deterministas
- **Estructuras Inmutables**: Tipos de datos que no se modifican después de su creación
- **Composición Funcional**: Pipeline construido mediante composición de funciones puras

### 3.2 Separación de Responsabilidades

- **Protocolo**: Define **qué** debe ocurrir
- **Implementación**: Define **cómo** ocurre

### 3.3 Señales, no Acciones

El protocolo produce **señales semánticas** (TrustLevel, AnomalyScore, PiDetection), no ejecuta acciones (bloqueos, validaciones). Las acciones pertenecen a la implementación.

---

## 4. Flujo del Protocolo

### 4.1 Pipeline de Procesamiento Semántico

El protocolo procesa contenido mediante un pipeline funcional puro:

```
┌─────────────────────────────────────────────────────────┐
│                    CORE SEMÁNTICO                        │
│                                                          │
│  CSLInput                                               │
│    │                                                     │
│    ▼                                                     │
│  segment() → CSLResult                                  │
│    │  (señales: TrustLevel, LineageEntry)               │
│    ▼                                                     │
│  sanitize() → ISLResult                                 │
│    │  (señales: PiDetection, AnomalyScore)            │
│    ▼                                                     │
│  envelope() → CPEResult                                 │
│    │  (estructura: CPEEnvelope)                        │
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
│  - Decide acciones (ALLOW/BLOCK/WARN)                   │
│  - Bloquea si es necesario                               │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Principio de Fail-Secure

El protocolo opera bajo el principio de **fail-secure** a nivel semántico: si cualquier capa produce señales que indican contenido inválido o malicioso, la implementación debe rechazar el prompt. El protocolo no ejecuta el rechazo, pero define las condiciones semánticas bajo las cuales debe ocurrir.

---

## 5. Capas del Protocolo

### 5.1 CSL: Context Segmentation Layer

#### Rol Semántico (Core)

CSL define el modelo semántico de segmentación del contenido y su clasificación por origen. **No prescribe cómo detectar inyecciones ni cómo normalizar el contenido**, sino que produce señales que permiten a capas posteriores o a implementaciones decidir acciones.

#### Funciones Principales del Core

**Segmentación Estructural:**
- Define cómo se segmenta el contenido en unidades estructurales
- No especifica algoritmos de segmentación semántica avanzada (eso es SDK)

**Clasificación por Origen:**
- Define el mapeo semántico: `Source → TrustLevel`
- `UI` → `TC` (Trusted Content)
- `SYSTEM` → `TC`
- `DOM` → `STC` (Semi-Trusted Content)
- `API` → `UC` (Untrusted Content)

**Inicialización de Linaje:**
- Define la estructura del linaje inicial
- Produce `LineageEntry` con `step` y `timestamp`

#### Lo que NO es CSL (Core)

El core de CSL **NO** contiene:

- ❌ Normalización Unicode (va al SDK)
- ❌ Eliminación de caracteres invisibles (va al SDK)
- ❌ Detección de Prompt Injection mediante heurísticas (va al SDK/ISL)
- ❌ Generación de hashes criptográficos (va al SDK)
- ❌ Serialización del contenido (va al SDK)
- ❌ Detección de MIME type (va al SDK)

#### Output Semántico de CSL

La capa CSL produce un `CSLResult` que contiene:

- Segmentos de contenido clasificados por nivel de confianza (TC/STC/UC)
- Linaje inicializado para trazabilidad
- Estructura inmutable que preserva el contenido original

#### Rol Operativo (SDK)

El SDK implementa:

- Lectura del DOM del navegador
- Detección de contenido oculto
- Aplicación de heurísticas de detección MIME
- Generación de hashes criptográficos
- Normalización del contenido

### 5.2 ISL: Instruction Sanitization Layer

#### Rol Semántico (Core)

ISL **NO bloquea, NO decide, NO normaliza**. En su lugar, ISL:

- Analiza resultados de CSL
- Produce señales de riesgo semánticas (PiDetection, AnomalyScore)
- Produce estructura sanitizada semántica

**ISL no ejecuta políticas ni bloqueos. Produce señales semánticas que describen el riesgo o validez de instrucciones presentes en el contenido.**

#### Funciones Principales del Core

**Producción de Señales:**
- `createPiDetection()`: Produce señal de detección de prompt injection
- `createAnomalyScore()`: Produce señal de score de anomalía
- `createPattern()`: Define patrón semántico para detección

**Sanitización Semántica:**
- Define estructura de contenido sanitizado
- Preserva intención legítima del usuario (semánticamente)
- Produce señales de nivel de sanitización aplicado

#### Lo que NO es ISL (Core)

El core de ISL **NO** contiene:

- ❌ Eliminación de comandos (va al SDK)
- ❌ Bloqueo de acciones (va al SDK/ModelGateway)
- ❌ Normalización agresiva (va al SDK)
- ❌ Filtrado heurístico avanzado (va al SDK)
- ❌ Decisiones de política (va al SDK/ModelGateway)

#### Output Semántico de ISL

La capa ISL produce un `ISLResult` que contiene:

- Contenido sanitizado (estructura semántica)
- Señales de riesgo (PiDetection, AnomalyScore)
- Linaje extendido con entrada ISL
- Metadatos de sanitización aplicada (semánticamente)

#### Rol Operativo (SDK)

El SDK implementa:

- Aplicación de normalización agresiva
- Implementación de políticas de bloqueo
- Decisiones finales (ALLOW/WARN/BLOCK)
- Serialización de contenido sanitizado

### 5.3 CPE: Cryptographic Prompt Envelope

#### Rol Semántico (Core)

**CPE define el contrato estructural del envoltorio criptográfico. La generación y verificación de firmas es responsabilidad de la implementación (SDK / ModelGateway).**

#### Funciones Principales del Core

**Definición de Estructura:**
- Define la estructura del `CPEEnvelope` (payload, metadata, signature, lineage)
- Define qué metadata es obligatoria (timestamp, nonce, protocolVersion)
- Define el contrato de firma (qué debe firmarse, no cómo)

**Generación de Metadata Semántica:**
- `createMetadata()`: Crea estructura de metadata
- `createNonce()`: Define la estructura semántica de un nonce
- `createSignature()`: Define estructura de firma (no implementa algoritmo)

#### Lo que NO es CPE (Core)

El core de CPE **NO** contiene:

- ❌ Implementación de algoritmos criptográficos (HMAC-SHA256) → SDK
- ❌ Serialización del contenido para firma → SDK
- ❌ Verificación de firmas → SDK/ModelGateway
- ❌ Validación de formato de signatures → SDK

#### Output Semántico de CPE

La capa CPE produce un `CPEResult` que contiene:

- Estructura del envelope con payload, metadata, signature
- Linaje completo preservado
- Estructura inmutable lista para firma (por el SDK)

#### Rol Operativo (SDK)

El SDK implementa:

- Generación del valor real del nonce (aleatoriedad criptográfica)
- Algoritmos criptográficos (HMAC-SHA256)
- Serialización de contenido para firma
- Verificación de firmas
- Validación de formato de signatures

### 5.4 ModelGateway: Infraestructura de Despliegue

#### Rol Semántico

**ModelGateway no forma parte del core semántico, sino de la infraestructura de despliegue del protocolo.**

#### Funciones Principales

**Evaluación de Señales:**
- Evalúa señales de CSL, ISL, CPE
- Puede evaluar señales provenientes de capas externas al core semántico (ej. AAL), definidas en documentos complementarios
- Produce recomendación semántica (ALLOW/BLOCK/WARN)

#### Rol Operativo (SDK/Infraestructura)

La implementación de ModelGateway:

- Aplica políticas de acceso
- Verifica firmas criptográficas
- Decide acciones finales
- Enruta al proveedor de IA
- Rechaza prompts sin envelope válido

---

## 6. Contratos Semánticos entre Capas

Los contratos definidos son **contratos semánticos**, no implementaciones técnicas. Especifican las estructuras de datos que fluyen entre capas.

### 6.1 Contrato CSL → ISL

#### Input Semántico: `CSLResult`

La capa CSL proporciona a ISL:

- Segmentos de contenido clasificados por nivel de confianza (TC/STC/UC)
- Linaje inicializado
- Estructura inmutable que preserva contenido original

**Nota**: El protocolo no especifica si el contenido debe estar normalizado o tener hashes. Eso es responsabilidad del SDK.

#### Output Semántico: `ISLResult`

ISL utiliza esta información para producir:

- Contenido sanitizado (estructura semántica)
- Señales de riesgo (PiDetection, AnomalyScore)
- Linaje extendido con entrada ISL

### 6.2 Contrato ISL → CPE

#### Input Semántico: `ISLResult`

La capa ISL proporciona a CPE:

- Contenido sanitizado y libre de instrucciones maliciosas (semánticamente)
- Señales de sanitización aplicada
- Linaje actualizado con la etapa ISL
- Estructura validada y consistente

#### Output Semántico: `CPEResult`

CPE utiliza esta información para producir:

- Estructura del envelope (payload, metadata, signature)
- Linaje completo preservado
- Estructura lista para firma (por el SDK)

**Nota**: El protocolo define la estructura del envelope, no cómo se firma. La firma es responsabilidad del SDK.

### 6.3 Contrato CPE → ModelGateway

#### Input Semántico: `CPEResult`

La capa CPE proporciona al ModelGateway:

- Estructura del envelope con metadata de seguridad
- Estructura de firma (valor y algoritmo)
- Linaje completo del procesamiento

#### Output Semántico: Recomendación

El ModelGateway evalúa las señales y produce:

- Recomendación semántica (ALLOW/BLOCK/WARN)
- La implementación ejecuta la acción correspondiente

**Nota**: El protocolo no especifica cómo se verifica la firma. Eso es responsabilidad de la implementación.

---

## 7. Garantías del Protocolo

### 7.1 Garantía de Integridad Semántica

El protocolo garantiza que todo contenido procesado:

- Ha sido segmentado y clasificado por origen (semánticamente)
- Ha sido evaluado mediante señales de sanitización
- Incluye metadata de seguridad estructurada
- Preserva linaje completo para trazabilidad

**Nota**: El protocolo define las condiciones necesarias para prevenir manipulación cuando es correctamente implementado. No garantiza la eliminación de vectores de ataque, sino que define las estructuras semánticas que permiten su prevención.

### 7.2 Garantía de Trazabilidad

Cada prompt procesado por el protocolo incluye:

- **Linaje completo**: Trazabilidad desde el origen hasta el modelo
- **Estructuras de integridad**: Identificadores que permiten verificación (definidos semánticamente)
- **Metadata de seguridad**: Información sobre el procesamiento aplicado

Esta información permite auditoría completa y verificación forense en caso de incidentes, cuando el protocolo es correctamente implementado.

### 7.3 Garantía de Composición

El pipeline completo se construye mediante composición de funciones puras:

- Cada capa es independiente
- Puede ejecutarse de forma aislada
- Fácil de testear y verificar
- Extensible sin modificar código existente

---

## 8. Principios de Diseño

### 8.1 Defensa en Profundidad (Semántica)

El protocolo define múltiples capas de señales semánticas que deben ser evaluadas antes de que un prompt pueda ser considerado válido. Si cualquier capa produce señales que indican contenido inválido, la implementación debe rechazar el prompt.

### 8.2 Fail-Secure (Semántico)

El protocolo opera bajo el principio de fallo seguro a nivel semántico: cualquier señal que indique contenido malicioso o inválido debe resultar en rechazo del prompt por parte de la implementación.

### 8.3 Procesamiento Previo (Semántico)

El protocolo define que todo el contenido debe ser procesado semánticamente antes de que el agente de IA pueda acceder a él. El agente nunca debe tener acceso a contenido que no haya sido procesado por el pipeline del protocolo.

### 8.4 Validación Estructural Obligatoria

El protocolo define que ningún prompt puede ser considerado válido sin una estructura de envelope completa. La validación real de firmas es responsabilidad de la implementación.

### 8.5 Trazabilidad Completa

Cada prompt procesado por el protocolo incluye linaje completo que permite auditoría y verificación forense. Esta trazabilidad es fundamental para la seguridad y el cumplimiento, cuando el protocolo es correctamente implementado.

---

## 9. Conclusión

AI-PIP proporciona una arquitectura semántica fundamental para la integridad de prompts mediante la definición de un protocolo formal compuesto por funciones puras, estructuras inmutables y contratos semánticos entre componentes.

La arquitectura de capas (CSL, ISL, CPE) implementa una estrategia de defensa en profundidad a nivel semántico que define las condiciones necesarias para prevenir ataques de prompt injection mediante segmentación, señales de sanitización y estructura de envelope criptográfico. El principio de fail-secure asegura que cualquier contenido que produzca señales de riesgo debe ser rechazado por la implementación.

**El protocolo opera como especificación abstracta independiente de implementación**, mientras que el SDK proporciona una implementación de referencia que traduce las señales semánticas del protocolo en acciones operativas concretas.

---

**Versión del Documento**: 2.0  
**Última Actualización**: 2024  
**Autor**: Felipe Masliah
**Licencia**: MIT

---

*Este documento describe la arquitectura semántica del protocolo. Para detalles de implementación, consultar la documentación del SDK.*
