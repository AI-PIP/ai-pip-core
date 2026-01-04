# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.7] - 2026-01-04

### 🐛 Critical Fixes

#### Type Resolution Fix
- **Fixed nested type resolution**: Changed `moduleResolution` from `"bundler"` to `"nodenext"` in `tsconfig.json`
- **Added explicit file extensions**: All relative imports now include `.js` extension (required by `nodenext`)
- **Fixed type accessibility**: Types with nested properties (e.g., `TrustLevel.value`) now resolve correctly in consuming projects

#### What This Fixes

**Problem**: When importing types from `@ai-pip/core` in SDK projects, TypeScript could not resolve nested type properties:
- `this.data.trust.value` appeared as `any` instead of `TrustLevelType`
- No autocompletado for nested properties
- Type inference failed for complex types

**Root Cause**: Incompatibility between `moduleResolution: "bundler"` (used in `@ai-pip-core`) and `moduleResolution: "nodenext"` (used in SDK projects). TypeScript couldn't follow the chain of type imports correctly.

**Solution**: 
- Aligned `moduleResolution` to `"nodenext"` in both projects
- Added explicit `.js` extensions to all relative imports (required by Node.js ESM resolution)
- Changed `module` from `"ESNext"` to `"NodeNext"` for consistency

**Impact**: 
- ✅ Nested types now resolve correctly
- ✅ Autocompletado works for all type properties
- ✅ Type inference works correctly in consuming projects
- ✅ Better compatibility with Node.js ESM module resolution

### 🔧 Technical Changes

- **Removed `tsconfig.json` from package files**: `tsconfig.json` is only needed for development, not for published packages
- **Updated `tsconfig.json`**:
  - `module: "ESNext"` → `module: "NodeNext"`
  - `moduleResolution: "bundler"` → `moduleResolution: "nodenext"`
- **Updated all source files**: Added `.js` extension to 107+ relative imports across the codebase

### 📦 Package Changes

- **Removed from `files` array**: `tsconfig.json` (only needed for development)
- **Package now includes**: `dist/`, `README.md`, `LICENSE` only

### ⚠️ Breaking Changes

**None** - This is a patch version that fixes type resolution issues without changing the API.

### 📚 Documentation

- Updated README to reference centralized CHANGELOG.md
- Added detailed explanation of type resolution fixes

---

## [0.1.6] - 2025-12-28

### 📚 Documentation Improvements
- **Centralized documentation**: Moved all protocol documentation to `ai-pip-docs` repository
- **Updated README**: Added comprehensive links to centralized documentation
- **Documentation structure**: Reorganized documentation section with links to whitepaper, architecture, roadmap, and SDK guides

### 🔧 Package Improvements
- **Documentation links**: All documentation now points to `ai-pip-docs` repository
- **README cleanup**: Removed redundant documentation sections, kept only code-specific documentation

---

## [0.1.5] - 2025-12-28

### 📚 Documentation Improvements
- **Updated README**: Added links to whitepaper, roadmap, and complete layer documentation
- **Updated Roadmap**: Added SDK-browser in Phase 4, updated Phase 1 status to 100% completed
- **Architecture clarification**: Corrected documentation about Shared (not a layer, but shared features)
- **SDK note**: Updated explanation about AAL and Model Gateway (they are SDK components, not core)

### 🔧 Optimizations
- **Package size reduction**: Removed `src/` from `files` field in `package.json` to make the package lighter
- **Optimized package**: Only necessary files are included (`dist/`, `tsconfig.json`, `README.md`, `LICENSE`)

### ✨ Improvements
- **Layer documentation**: Added link to Shared documentation (shared features)
- **Documentation organization**: Reorganized documentation section with priority on whitepaper and roadmap

---

## [0.1.3] - 2025-12-28

### ✨ New Features
- **JavaScript compilation**: The package now compiles to JavaScript (`dist/`) for better compatibility
- **Type declaration files**: `.d.ts` files are generated for full TypeScript support
- **Source maps**: Included for better debugging

### 🔧 Technical Changes
- **Publication structure**: Changed from publishing `.ts` files directly to compiling to `dist/`
- **Improved exports**: Exports now point to compiled files (`.js` and `.d.ts`)
- **Relative paths**: Replaced path aliases (`@/`) with relative paths for compatibility
- **Build configuration**: Fixed generation of `.d.ts` files in `dist/` instead of `src/`
- **ESLint**: Configured to ignore generated `.d.ts` files

### 🐛 Fixes
- **Type resolution**: TypeScript types now resolve correctly from `node_modules`
- **Imports from subpaths**: Fixed imports from `@ai-pip/core/csl`, `@ai-pip/core/isl`, etc.
- **Complete exports**: Added `default` field to all exports for Node.js ESM
- **File generation**: `.d.ts` files now generate correctly in `dist/`

### 📚 Documentation
- **TypeScript requirements**: Improved documentation about required configuration
- **Updated examples**: Usage examples updated for new structure
- **Complete CHANGELOG**: Documentation of all versions and deprecations

### 🛠️ Development Improvements
- **test:install script**: Script to verify installation before publishing
- **prepublishOnly script**: Automatically runs build, lint, tests, and test:install before publishing

### ⚠️ Breaking Changes
- **TypeScript configuration required**: It's now **mandatory** to use `module: "NodeNext"` and `moduleResolution: "nodenext"` in `tsconfig.json`

---

## [0.1.2] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: This version had issues with compilation and `.d.ts` file generation. Files were generated in incorrect locations (`src/` instead of `dist/`), causing linting errors and type resolution problems.

**Known issues**:
- `.d.ts` files were generated in `src/` instead of `dist/`
- ESLint tried to lint generated `.d.ts` files, causing errors
- Incomplete build configuration (`declarationDir` misconfigured)
- Types did not resolve correctly in some cases

**Recommendation**: Update to `0.1.3` or higher.

---

## [0.1.1] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: This version had issues with path alias resolution (`@/`) that caused errors when importing from other projects. Types did not resolve correctly when the package was installed from npm.

**Known issues**:
- Errors: `Module '"@ai-pip/core/csl"' has no exported member 'CSLResult'`
- Path aliases did not work in consumer projects
- Types did not resolve correctly from `node_modules`

**Recommendation**: Update to `0.1.3` or higher.

---

## [0.1.0] - 2025-12-28

### ⚠️ DEPRECATED

**Deprecation reason**: Initial version with fundamental compatibility issues. Exports did not include the `default` field required by Node.js ESM, causing `ERR_PACKAGE_PATH_NOT_EXPORTED` errors.

**Known issues**:
- Errors: `ERR_PACKAGE_PATH_NOT_EXPORTED` when importing subpaths
- Incomplete exports: Missing `default` field in exports
- Path aliases did not work correctly

**Recommendation**: Update to `0.1.3` or higher.

### 📦 Initial Content
- **CSL (Context Segmentation Layer)**: Content segmentation and classification
- **ISL (Instruction Sanitization Layer)**: Instruction sanitization
- **CPE (Cryptographic Prompt Envelope)**: Cryptographic envelope with HMAC-SHA256

---

**Current Version**: 0.1.7  
**Status**: Phase 1 - Core Layers (100% completed)

