# @ai-pip/core

> Core implementation of the AI-PIP protocol. Provides layered, zero-trust context processing (CSL, ISL, CPE) to protect AI systems from prompt injection and malicious context manipulation.

[![npm version](https://img.shields.io/npm/v/@ai-pip/core)](https://www.npmjs.com/package/@ai-pip/core)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

## 📋 Description

**AI-PIP (AI Prompt Integrity Protocol)** is a multi-layer security protocol designed to protect AI systems against prompt injection and malicious context manipulation.

This package contains the **core** implementation of the protocol, which includes pure functions, immutable value objects, and semantic contracts between layers.

## 🏗️ Architecture

The AI-PIP protocol is composed of the following layers:

### ✅ Implemented Layers

- **CSL (Context Segmentation Layer)**: Segments and classifies content according to its origin
- **ISL (Instruction Sanitization Layer)**: Sanitizes instructions according to trust level
- **CPE (Cryptographic Prompt Envelope)**: Generates cryptographic envelope with HMAC-SHA256 signature

### 🔧 Shared Features

- **Shared**: Shared functions and global incremental lineage (not a layer, but features shared between layers)

### 📝 Note on AAL and Model Gateway

**AAL (Agent Action Lock)** and **Model Gateway** are SDK components, not part of the semantic core. The semantic core focuses on pure functions and signals, while these layers require operational decisions and side effects that belong to the implementation (SDK).

## 📦 Installation

```bash
pnpm add @ai-pip/core
# or
npm install @ai-pip/core
# or
yarn add @ai-pip/core
```

## 🚀 Basic Usage

### Import from main package

```typescript
import { segment, sanitize, envelope } from '@ai-pip/core'
import type { CSLResult, ISLResult, CPEResult } from '@ai-pip/core'
```

### Complete Example

```typescript
import { segment, sanitize, envelope } from '@ai-pip/core'
import type { CSLResult, ISLResult, CPEResult } from '@ai-pip/core'

// 1. Segment content (CSL)
const cslResult: CSLResult = segment({
  content: 'User input here',
  source: 'UI',
  metadata: {}
})

// 2. Sanitize content (ISL)
const islResult: ISLResult = sanitize(cslResult)

// 3. Generate cryptographic envelope (CPE)
const secretKey = 'your-secret-key'
const cpeResult: CPEResult = envelope(islResult, secretKey)

// cpeResult.envelope contains the protected prompt
console.log(JSON.stringify(cpeResult, null, 2))
```

### Example with additional functions

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

// Classify a source
const trust = classifySource('UI' as Source)

// Add lineage entry
const updatedLineage = addLineageEntry(cslResult.lineage, {
  step: 'CUSTOM',
  timestamp: Date.now()
})

// Generate nonce
const nonce = createNonce()
```

## 📚 Documentation

All AI-PIP protocol documentation is centralized in the [documentation repository](https://github.com/AI-PIP/ai-pip-docs):

### Protocol Documentation

- **[Whitepaper](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/whitepaper.md)** - Complete technical specification
- **[Architecture](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/architecture.md)** - Semantic architecture
- **[Roadmap](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/roadmap.md)** - Development plan

### Core Documentation

- **[Core Overview](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/core/CORE.md)** - Semantic core description
- **[CSL (Context Segmentation Layer)](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/core/layers/CSL.md)** - Context segmentation layer
- **[ISL (Instruction Sanitization Layer)](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/core/layers/ISL.md)** - Instruction sanitization layer
- **[CPE (Cryptographic Prompt Envelope)](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/core/layers/CPE.md)** - Cryptographic prompt envelope
- **[Shared](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/core/layers/shared.md)** - Shared features and lineage

### SDK Documentation

- **[SDK](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/sdk/sdk.md)** - SDK implementation guide
- **[SDK Reference](https://github.com/AI-PIP/ai-pip-docs/blob/main/docs/sdk/sdk-reference.md)** - Complete SDK reference guide

### Code-Specific Documentation

- **[CHANGELOG](./CHANGELOG.md)** - Package version history
- **[API Reference](#-basic-usage)** - Usage examples in this README

## 🧪 Testing

```bash
# Run tests
pnpm test

# Tests in watch mode
pnpm test:watch

# Tests with coverage
pnpm test:coverage

# Test UI
pnpm test:ui
```

**Current coverage**: 87%

## 🔧 Development

```bash
# Install dependencies
pnpm install

# Type checking
pnpm type-check

# Linting
pnpm lint

# Development
pnpm dev
```

## 📋 Requirements

### Runtime
- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0 (recommended) or npm/yarn

### TypeScript ⚠️ **REQUIRED**

This package uses ESM (`"type": "module"`) and exports with subpaths. For TypeScript to correctly resolve imports and types, your project **MUST** have the following configuration in `tsconfig.json`:

**Minimum required configuration:**

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "nodenext",
    "target": "ES2022"
  }
}
```

**⚠️ CRITICAL**: Without this configuration, you will get errors like:
- `Module '"@ai-pip/core/csl"' has no exported member 'CSLResult'`
- `ERR_PACKAGE_PATH_NOT_EXPORTED`
- Types will not resolve correctly

#### Recommended complete `tsconfig.json` example

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

#### Important notes

- **From version 0.1.2+**: This configuration is mandatory. Previous versions (0.1.0, 0.1.1) are deprecated.
- **If you use `tsx` or `ts-node`**: Even if you run TypeScript directly, you **still need** this configuration in `tsconfig.json` for TypeScript to resolve types correctly.
- **Pure JavaScript**: If you use JavaScript without TypeScript, you don't need this configuration, but you will lose type support.

## 📄 License

Apache-2.0 - See [LICENSE](LICENSE) for more details.

## 🤝 Contributing

Contributions are welcome. Please:

1. Review the [Roadmap](https://github.com/AI-PIP/ai-pip-docs/blob/main/roadmap.md) to see what's pending
2. Open an issue to discuss major changes
3. Submit a pull request with your improvements

**Repository**: https://github.com/AI-PIP/ai-pip-core  
**Issues**: https://github.com/AI-PIP/ai-pip-core/issues

## 🔗 Links

- **Documentation**: [ai-pip-docs](https://github.com/AI-PIP/ai-pip-docs)
- **NPM Package**: https://www.npmjs.com/package/@ai-pip/core
- **GitHub**: https://github.com/AI-PIP/ai-pip-core

## 🔮 Future Improvements

### Imports by Specific Layer

Currently, it's recommended to import from the main package (`@ai-pip/core`) to avoid confusion with similar names between layers. In future versions, support for direct imports from specific layers will be improved:

```typescript
// Future (in development)
import { segment } from '@ai-pip/core/csl'
import { sanitize } from '@ai-pip/core/isl'
import { envelope } from '@ai-pip/core/cpe'
```

This will enable:
- **Better organization**: Import only what's needed from each layer
- **Avoid conflicts**: Prevent confusion with similarly named functions
- **Improved tree-shaking**: Bundlers will be able to eliminate unused code more efficiently

**Note**: Exports by layer are technically available, but it's recommended to use the main package until module resolution optimization is complete.

---

## 📝 CHANGELOG

### [0.1.5] - 2025-12-28

#### 📚 Documentation Improvements
- **Updated README**: Added links to whitepaper, roadmap, and complete layer documentation
- **Updated Roadmap**: Added SDK-browser in Phase 4, updated Phase 1 status to 100% completed
- **Architecture clarification**: Corrected documentation about Shared (not a layer, but shared features)
- **SDK note**: Updated explanation about AAL and Model Gateway (they are SDK components, not core)

#### 🔧 Optimizations
- **Package size reduction**: Removed `src/` from `files` field in `package.json` to make the package lighter
- **Optimized package**: Only necessary files are included (`dist/`, `tsconfig.json`, `README.md`, `LICENSE`)

#### ✨ Improvements
- **Layer documentation**: Added link to Shared documentation (shared features)
- **Documentation organization**: Reorganized documentation section with priority on whitepaper and roadmap

---

### [0.1.3] - 2025-12-28

#### ✨ New Features
- **JavaScript compilation**: The package now compiles to JavaScript (`dist/`) for better compatibility
- **Type declaration files**: `.d.ts` files are generated for full TypeScript support
- **Source maps**: Included for better debugging

#### 🔧 Technical Changes
- **Publication structure**: Changed from publishing `.ts` files directly to compiling to `dist/`
- **Improved exports**: Exports now point to compiled files (`.js` and `.d.ts`)
- **Relative paths**: Replaced path aliases (`@/`) with relative paths for compatibility
- **Build configuration**: Fixed generation of `.d.ts` files in `dist/` instead of `src/`
- **ESLint**: Configured to ignore generated `.d.ts` files

#### 🐛 Fixes
- **Type resolution**: TypeScript types now resolve correctly from `node_modules`
- **Imports from subpaths**: Fixed imports from `@ai-pip/core/csl`, `@ai-pip/core/isl`, etc.
- **Complete exports**: Added `default` field to all exports for Node.js ESM
- **File generation**: `.d.ts` files now generate correctly in `dist/`

#### 📚 Documentation
- **TypeScript requirements**: Improved documentation about required configuration
- **Updated examples**: Usage examples updated for new structure
- **Complete CHANGELOG**: Documentation of all versions and deprecations

#### 🛠️ Development Improvements
- **test:install script**: Script to verify installation before publishing
- **prepublishOnly script**: Automatically runs build, lint, tests, and test:install before publishing

#### ⚠️ Breaking Changes
- **TypeScript configuration required**: It's now **mandatory** to use `module: "NodeNext"` and `moduleResolution: "nodenext"` in `tsconfig.json`

---

### [0.1.2] - 2025-12-28

#### ⚠️ DEPRECATED

**Deprecation reason**: This version had issues with compilation and `.d.ts` file generation. Files were generated in incorrect locations (`src/` instead of `dist/`), causing linting errors and type resolution problems.

**Known issues**:
- `.d.ts` files were generated in `src/` instead of `dist/`
- ESLint tried to lint generated `.d.ts` files, causing errors
- Incomplete build configuration (`declarationDir` misconfigured)
- Types did not resolve correctly in some cases

**Recommendation**: Update to `0.1.3` or higher.

---

### [0.1.1] - 2025-12-28

#### ⚠️ DEPRECATED

**Deprecation reason**: This version had issues with path alias resolution (`@/`) that caused errors when importing from other projects. Types did not resolve correctly when the package was installed from npm.

**Known issues**:
- Errors: `Module '"@ai-pip/core/csl"' has no exported member 'CSLResult'`
- Path aliases did not work in consumer projects
- Types did not resolve correctly from `node_modules`

**Recommendation**: Update to `0.1.3` or higher.

---

### [0.1.0] - 2025-12-28

#### ⚠️ DEPRECATED

**Deprecation reason**: Initial version with fundamental compatibility issues. Exports did not include the `default` field required by Node.js ESM, causing `ERR_PACKAGE_PATH_NOT_EXPORTED` errors.

**Known issues**:
- Errors: `ERR_PACKAGE_PATH_NOT_EXPORTED` when importing subpaths
- Incomplete exports: Missing `default` field in exports
- Path aliases did not work correctly

**Recommendation**: Update to `0.1.3` or higher.

#### 📦 Initial Content
- **CSL (Context Segmentation Layer)**: Content segmentation and classification
- **ISL (Instruction Sanitization Layer)**: Instruction sanitization
- **CPE (Cryptographic Prompt Envelope)**: Cryptographic envelope with HMAC-SHA256

---

**Current Version**: 0.1.5  
**Status**: Phase 1 - Core Layers (100% completed)
