# @ai-pip/core

> Core implementation of the AI-PIP protocol. Provides layered, zero-trust context processing (CSL, ISL, CPE) to protect AI systems from prompt injection and malicious context manipulation.

[![npm version](https://img.shields.io/npm/v/@ai-pip/core)](https://www.npmjs.com/package/@ai-pip/core)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

## 📋 Descripción

**AI-PIP (AI Prompt Integrity Protocol)** es un protocolo de seguridad de múltiples capas diseñado para proteger sistemas de IA contra prompt injection y manipulación maliciosa de contexto.

Este paquete contiene la implementación **core** del protocolo, que incluye funciones puras, value objects inmutables y contratos semánticos entre capas.

## 🏗️ Arquitectura

El protocolo AI-PIP está compuesto por las siguientes capas:

### ✅ Capas Implementadas

- **CSL (Context Segmentation Layer)**: Segmenta y clasifica contenido según su origen
- **ISL (Instruction Sanitization Layer)**: Sanitiza instrucciones según nivel de confianza
- **CPE (Cryptographic Prompt Envelope)**: Genera envoltorio criptográfico con firma HMAC-SHA256

### ⏳ Capas Pendientes

- **AAL (Agent Action Lock)**: Bloqueo de acciones de agentes
- **Model Gateway**: Interfaz con modelos de IA

## 📦 Instalación

```bash
pnpm add @ai-pip/core
# o
npm install @ai-pip/core
# o
yarn add @ai-pip/core
```

## 🚀 Uso Básico

### Importar capas completas

```typescript
import { segment, sanitize, envelope } from '@ai-pip/core'
```

### Importar capas específicas

```typescript
// CSL - Context Segmentation Layer
import { segment, classifySource } from '@ai-pip/core/csl'

// ISL - Instruction Sanitization Layer
import { sanitize, createPolicyRule } from '@ai-pip/core/isl'

// CPE - Cryptographic Prompt Envelope
import { envelope, createNonce } from '@ai-pip/core/cpe'

// Shared utilities
import { addLineageEntry } from '@ai-pip/core/shared'
```

### Ejemplo Completo

```typescript
import { segment } from '@ai-pip/core/csl'
import { sanitize } from '@ai-pip/core/isl'
import { envelope } from '@ai-pip/core/cpe'

// 1. Segmentar contenido (CSL)
const cslResult = segment({
  content: 'User input here',
  source: 'UI',
  metadata: {}
})

// 2. Sanitizar contenido (ISL)
const islResult = sanitize(cslResult)

// 3. Generar envelope criptográfico (CPE)
const secretKey = 'your-secret-key'
const cpeResult = envelope(islResult, secretKey)

// cpeResult.envelope contiene el prompt protegido
```

## 📚 Documentación

### Documentación de Capas

- **[CSL - Context Segmentation Layer](docs/layer/csl.md)**: Documentación completa de la capa de segmentación
- **[ISL - Instruction Sanitization Layer](docs/layer/isl.md)**: Documentación completa de la capa de sanitización
- **[CPE - Cryptographic Prompt Envelope](docs/layer/cpe.md)**: Documentación completa del envoltorio criptográfico

### Documentación General

- **[Arquitectura](docs/architecture.md)**: Arquitectura semántica del protocolo
- **[Roadmap](docs/roadmap.md)**: Plan de desarrollo y evolución
- **[Whitepaper](docs/whitepaper.md)**: Especificación técnica completa
- **[SDK Reference](docs/SDK.md)**: Referencia para desarrollo de SDKs

## 🧪 Testing

```bash
# Ejecutar tests
pnpm test

# Tests en modo watch
pnpm test:watch

# Tests con cobertura
pnpm test:coverage

# UI de tests
pnpm test:ui
```

**Cobertura actual**: 87%

## 🔧 Desarrollo

```bash
# Instalar dependencias
pnpm install

# Type checking
pnpm type-check

# Linting
pnpm lint

# Desarrollo
pnpm dev
```

## 📋 Requisitos

### Runtime
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (recomendado) o npm/yarn

### TypeScript

Este paquete utiliza ESM (`"type": "module"`) y exports con subpaths. Para que TypeScript resuelva correctamente los imports, tu proyecto **debe** tener la siguiente configuración en `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "target": "ES2022",
    // ... otras opciones
  }
}
```

**⚠️ Importante**: Sin esta configuración, TypeScript no podrá resolver los subpaths como `@ai-pip/core/csl`, `@ai-pip/core/isl`, etc., y obtendrás errores como `ERR_PACKAGE_PATH_NOT_EXPORTED`.

#### Ejemplo de `tsconfig.json` completo

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### Si usas un runtime como `tsx` o `ts-node`

Aunque uses `tsx` o `ts-node` para ejecutar TypeScript directamente, **aún necesitas** la configuración correcta en `tsconfig.json` para que TypeScript resuelva los tipos y los imports correctamente.

## 📄 Licencia

Apache-2.0 - Ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Revisa el [Roadmap](docs/roadmap.md) para ver qué está pendiente
2. Abre un issue para discutir cambios mayores
3. Envía un pull request con tus mejoras

**Repositorio**: https://github.com/AI-PIP/ai-pip-core  
**Issues**: https://github.com/AI-PIP/ai-pip-core/issues

## 🔗 Enlaces

- **Documentación**: [docs/](docs/)
- **NPM Package**: https://www.npmjs.com/package/@ai-pip/core
- **GitHub**: https://github.com/AI-PIP/ai-pip-core

---

**Versión**: 0.1.0  
**Estado**: Fase 1 - Capas Core (60% completado)
