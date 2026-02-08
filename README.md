# @ai-pip/core

[![npm version](https://img.shields.io/npm/v/@ai-pip/core)](https://www.npmjs.com/package/@ai-pip/core)
[![npm downloads](https://img.shields.io/npm/dm/@ai-pip/core)](https://www.npmjs.com/package/@ai-pip/core)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

**Core implementation of the AI-PIP protocol.** Layered, zero-trust context processing and transversal integrity for AI systems.

---

## Why AI-PIP?

AI-powered browsers and chat interfaces (e.g. **GPT Atlas**, embedded AI in web apps) create new attack surfaces: **prompt injection**, **hidden text**, **jailbreaking**, and **role hijacking**. The AI-PIP (AI Prompt Integrity Protocol) was designed to improve the security of these environments by providing **rules and tools** to detect, score, and respond to such threats before content reaches the model. This package is the **semantic core** of that protocol—pure functions, immutable value objects, and clear contracts between layers—so that SDKs and applications can build secure, auditable pipelines.

---

## Description

**AI-PIP** is a multi-layer security protocol that protects AI systems from prompt injection and malicious context manipulation. This package contains the **core** implementation: it does not execute network calls or side effects; it provides the logic for segmentation, sanitization, risk scoring, policy decisions, and remediation plans. The **official AI-PIP SDK** (in development) will use this core to deliver production-ready features, including browser extensions and integrations for AI-powered applications.

---

## Architecture (summary)

| Layer | Role |
|-------|------|
| **CSL** (Context Segmentation Layer) | Segments and classifies content by origin (UI, DOM, API, SYSTEM). |
| **ISL** (Instruction Sanitization Layer) | Detects threats (~287 patterns), scores risk, sanitizes content, and emits a **signal** (risk score, detections) for other layers. |
| **AAL** (Agent Action Lock) | Consumes the ISL signal and applies policy: **ALLOW**, **WARN**, or **BLOCK**. Produces a **remediation plan** (what to clean—target segments, goals, constraints); the SDK or an AI agent performs the actual cleanup. |
| **CPE** (Cryptographic Prompt Envelope) | **Transversal**: ensures the **integrity of each layer**. Wraps pipeline output with a signed envelope (nonce, metadata, HMAC-SHA256) so that results can be verified. Implemented in `shared/envelope`; exported as `@ai-pip/core/cpe`. |

The processing pipeline is **CSL → ISL** (optionally **AAL** consumes the signal). **CPE** is not a step in that sequence—it is a transversal capability that can wrap the result at any point to guarantee integrity. Layers communicate via **signals**, not internal results, so that each layer stays independent and testable.

---

## Installation

```bash
pnpm add @ai-pip/core
# or
npm install @ai-pip/core
# or
yarn add @ai-pip/core
```

---

## Usage example

Segment user input, sanitize it, optionally get a risk decision and remediation plan, and wrap the result in a cryptographic envelope:

```typescript
import { segment, sanitize, emitSignal, resolveAgentAction, buildRemediationPlan, envelope } from '@ai-pip/core'
import type { AgentPolicy } from '@ai-pip/core'

const cslResult = segment({ content: userInput, source: 'UI', metadata: {} })
const islResult = sanitize(cslResult)
const signal = emitSignal(islResult)
const policy: AgentPolicy = {
  thresholds: { warn: 0.3, block: 0.7 },
  remediation: { enabled: true }
}
const action = resolveAgentAction(signal, policy)  // 'ALLOW' | 'WARN' | 'BLOCK'
const remediationPlan = buildRemediationPlan(islResult, policy)
const cpeResult = envelope(islResult, secretKey)   // integrity for the pipeline result

if (action === 'BLOCK') {
  // SDK: block the request, log, and optionally run cleanup using remediationPlan
}
if (remediationPlan.needsRemediation) {
  // SDK or AI agent: clean targetSegments using goals and constraints
}
```

---

## Documentation

- **Full README** (examples, use cases, audit, all layers): [docs/readme.md](./docs/readme.md)
- **Protocol docs** (whitepaper, architecture, layers): [AI-PIP documentation repository](https://github.com/AI-PIP/ai-pip-docs)
- **Package changelog**: [CHANGELOG.md](./CHANGELOG.md)  
- **Features by version**: [FEATURE.md](./FEATURE.md)

---

## Requirements

- **Node.js** ≥ 18
- **TypeScript**: For correct imports and types, your `tsconfig.json` must use:
  - `"module": "NodeNext"`
  - `"moduleResolution": "nodenext"`
  - `"target": "ES2022"` (or compatible)

Without this, you may see resolution errors for subpaths (`@ai-pip/core/csl`, etc.). See [docs/readme.md](./docs/readme.md) for a full configuration example.

---

## License

Apache-2.0. See [LICENSE](LICENSE).

---

**Repository**: [github.com/AI-PIP/ai-pip-core](https://github.com/AI-PIP/ai-pip-core) · **npm**: [@ai-pip/core](https://www.npmjs.com/package/@ai-pip/core)
