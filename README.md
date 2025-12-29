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

### 🔧 Features Compartidas

- **Shared**: Funciones compartidas y linaje global e incremental (no es una capa, son features compartidas entre capas)

### 📝 Nota sobre AAL y Model Gateway

**AAL (Agent Action Lock)** y **Model Gateway** son componentes del SDK, no del core semántico. El core semántico se enfoca en funciones puras y señales, mientras que estas capas requieren decisiones operativas y efectos secundarios que pertenecen a la implementación (SDK).

## 📦 Instalación

```bash
pnpm add @ai-pip/core
# o
npm install @ai-pip/core
# o
yarn add @ai-pip/core
```

## 🚀 Uso Básico

### Importar desde el paquete principal

```typescript
import { segment, sanitize, envelope } from '@ai-pip/core'
import type { CSLResult, ISLResult, CPEResult } from '@ai-pip/core'
```

### Ejemplo Completo

```typescript
import { segment, sanitize, envelope } from '@ai-pip/core'
import type { CSLResult, ISLResult, CPEResult } from '@ai-pip/core'

// 1. Segmentar contenido (CSL)
const cslResult: CSLResult = segment({
  content: 'User input here',
  source: 'UI',
  metadata: {}
})

// 2. Sanitizar contenido (ISL)
const islResult: ISLResult = sanitize(cslResult)

// 3. Generar envelope criptográfico (CPE)
const secretKey = 'your-secret-key'
const cpeResult: CPEResult = envelope(islResult, secretKey)

// cpeResult.envelope contiene el prompt protegido
console.log(JSON.stringify(cpeResult, null, 2))
```

### Ejemplo con funciones adicionales

```typescript
import {
  segment,
  sanitize,
  envelope,
  classifySource,
  addLineageEntry,
  createNonce
} from '@ai-pip/core'
import type {
  CSLResult,
  ISLResult,
  CPEResult,
  Source,
  TrustLevel
} from '@ai-pip/core'

// Clasificar un source
const trust = classifySource('UI' as Source)

// Agregar entrada de linaje
const updatedLineage = addLineageEntry(cslResult.lineage, {
  step: 'CUSTOM',
  timestamp: Date.now()
})

// Generar nonce
const nonce = createNonce()
```

## 📚 Documentación

### Documentación de Capas

- **[CSL - Context Segmentation Layer](docs/layer/csl.md)**: Documentación completa de la capa de segmentación
- **[ISL - Instruction Sanitization Layer](docs/layer/isl.md)**: Documentación completa de la capa de sanitización
- **[CPE - Cryptographic Prompt Envelope](docs/layer/cpe.md)**: Documentación completa del envoltorio criptográfico


- **[Shared - Features Compartidas](docs/layer/shared.md)**: Funciones compartidas y linaje global

### Documentación General

- **[Whitepaper](docs/whitepaper.md)**: Especificación técnica completa del protocolo AI-PIP
- **[Roadmap](docs/roadmap.md)**: Plan de desarrollo y evolución del protocolo
- **[Arquitectura](docs/architecture.md)**: Arquitectura semántica del protocolo
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

### TypeScript ⚠️ **REQUERIDO**

Este paquete utiliza ESM (`"type": "module"`) y exports con subpaths. Para que TypeScript resuelva correctamente los imports y tipos, tu proyecto **DEBE** tener la siguiente configuración en `tsconfig.json`:

**Configuración mínima requerida:**

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "target": "ES2022"
  }
}
```

**⚠️ CRÍTICO**: Sin esta configuración, obtendrás errores como:
- `Module '"@ai-pip/core/csl"' has no exported member 'CSLResult'`
- `ERR_PACKAGE_PATH_NOT_EXPORTED`
- Los tipos no se resolverán correctamente

#### Ejemplo de `tsconfig.json` completo recomendado

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

#### Notas importantes

- **Desde la versión 0.1.2+**: Esta configuración es obligatoria. Las versiones anteriores (0.1.0, 0.1.1) están deprecadas.
- **Si usas `tsx` o `ts-node`**: Aunque ejecutes TypeScript directamente, **aún necesitas** esta configuración en `tsconfig.json` para que TypeScript resuelva los tipos correctamente.
- **JavaScript puro**: Si usas JavaScript sin TypeScript, no necesitas esta configuración, pero perderás el soporte de tipos.

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

## 🔮 Mejoras Futuras

### Imports por Capa Específica

Actualmente, se recomienda importar desde el paquete principal (`@ai-pip/core`) para evitar confusiones con nombres similares entre capas. En futuras versiones, se mejorará el soporte para imports directos desde capas específicas:

```typescript
// Futuro (en desarrollo)
import { segment } from '@ai-pip/core/csl'
import { sanitize } from '@ai-pip/core/isl'
import { envelope } from '@ai-pip/core/cpe'
```

Esto permitirá:
- **Mejor organización**: Importar solo lo necesario de cada capa
- **Evitar conflictos**: Prevenir confusiones con funciones de nombres similares
- **Tree-shaking mejorado**: Los bundlers podrán eliminar código no usado más eficientemente

**Nota**: Los exports por capa están técnicamente disponibles, pero se recomienda usar el paquete principal hasta que se complete la optimización de resolución de módulos.

---

## 📝 CHANGELOG

### [0.1.5] - 2025-12-28

#### 📚 Mejoras de Documentación
- **README actualizado**: Agregados links a whitepaper, roadmap y documentación completa de capas
- **Roadmap actualizado**: Agregado SDK-browser en Fase 4, actualizado estado de Fase 1 a 100% completado
- **Clarificación de arquitectura**: Corregida documentación sobre Shared (no es una capa, son features compartidas)
- **Nota sobre SDK**: Actualizada explicación sobre AAL y Model Gateway (son componentes del SDK, no del core)

#### 🔧 Optimizaciones
- **Reducción de tamaño del paquete**: Removido `src/` del campo `files` en `package.json` para hacer el paquete más liviano
- **Paquete optimizado**: Solo se incluyen archivos necesarios (`dist/`, `tsconfig.json`, `README.md`, `LICENSE`)

#### ✨ Mejoras
- **Documentación de capas**: Agregado link a documentación de Shared (features compartidas)
- **Organización de documentación**: Reorganizada sección de documentación con prioridad en whitepaper y roadmap

---

### [0.1.3] - 2025-12-28

#### ✨ Nuevas características
- **Compilación a JavaScript**: El paquete ahora se compila a JavaScript (`dist/`) para mayor compatibilidad
- **Archivos de declaración de tipos**: Se generan archivos `.d.ts` para soporte completo de TypeScript
- **Source maps**: Incluidos para mejor debugging

#### 🔧 Cambios técnicos
- **Estructura de publicación**: Cambio de publicar archivos `.ts` directamente a compilar a `dist/`
- **Exports mejorados**: Los exports ahora apuntan a archivos compilados (`.js` y `.d.ts`)
- **Rutas relativas**: Reemplazo de path aliases (`@/`) por rutas relativas para compatibilidad
- **Configuración de build**: Corregida la generación de archivos `.d.ts` en `dist/` en lugar de `src/`
- **ESLint**: Configurado para ignorar archivos `.d.ts` generados

#### 🐛 Correcciones
- **Resolución de tipos**: Los tipos TypeScript ahora se resuelven correctamente desde `node_modules`
- **Imports desde subpaths**: Corregidos los imports desde `@ai-pip/core/csl`, `@ai-pip/core/isl`, etc.
- **Exports completos**: Agregado campo `default` a todos los exports para Node.js ESM
- **Generación de archivos**: Archivos `.d.ts` ahora se generan correctamente en `dist/`

#### 📚 Documentación
- **Requisitos de TypeScript**: Documentación mejorada sobre configuración requerida
- **Ejemplos actualizados**: Ejemplos de uso actualizados para la nueva estructura
- **CHANGELOG completo**: Documentación de todas las versiones y deprecaciones

#### 🛠️ Mejoras de desarrollo
- **Script test:install**: Script para verificar instalación antes de publicar
- **Script prepublishOnly**: Ejecuta automáticamente build, lint, tests y test:install antes de publicar

#### ⚠️ Breaking Changes
- **Configuración TypeScript requerida**: Ahora es **obligatorio** usar `module: "NodeNext"` y `moduleResolution: "nodenext"` en `tsconfig.json`

---

### [0.1.2] - 2025-12-28

#### ⚠️ DEPRECADA

**Motivo de deprecación**: Esta versión tenía problemas con la compilación y generación de archivos `.d.ts`. Los archivos se generaban en ubicaciones incorrectas (`src/` en lugar de `dist/`), causando errores de linting y problemas de resolución de tipos.

**Problemas conocidos**:
- Archivos `.d.ts` se generaban en `src/` en lugar de `dist/`
- ESLint intentaba lintear archivos `.d.ts` generados, causando errores
- Configuración de build incompleta (`declarationDir` mal configurado)
- Los tipos no se resolvían correctamente en algunos casos

**Recomendación**: Actualizar a `0.1.3` o superior.

---

### [0.1.1] - 2025-12-28

#### ⚠️ DEPRECADA

**Motivo de deprecación**: Esta versión tenía problemas con la resolución de path aliases (`@/`) que causaban errores al importar desde otros proyectos. Los tipos no se resolvían correctamente cuando el paquete se instalaba desde npm.

**Problemas conocidos**:
- Errores: `Module '"@ai-pip/core/csl"' has no exported member 'CSLResult'`
- Path aliases no funcionaban en proyectos consumidores
- Tipos no se resolvían correctamente desde `node_modules`

**Recomendación**: Actualizar a `0.1.3` o superior.

---

### [0.1.0] - 2025-12-28

#### ⚠️ DEPRECADA

**Motivo de deprecación**: Versión inicial con problemas fundamentales de compatibilidad. Los exports no incluían el campo `default` requerido por Node.js ESM, causando errores `ERR_PACKAGE_PATH_NOT_EXPORTED`.

**Problemas conocidos**:
- Errores: `ERR_PACKAGE_PATH_NOT_EXPORTED` al importar subpaths
- Exports incompletos: Faltaba el campo `default` en los exports
- Path aliases no funcionaban correctamente

**Recomendación**: Actualizar a `0.1.3` o superior.

#### 📦 Contenido inicial
- **CSL (Context Segmentation Layer)**: Segmentación y clasificación de contenido
- **ISL (Instruction Sanitization Layer)**: Sanitización de instrucciones
- **CPE (Cryptographic Prompt Envelope)**: Envoltorio criptográfico con HMAC-SHA256

---

**Versión actual**: 0.1.5  
**Estado**: Fase 1 - Capas Core (100% completado)
