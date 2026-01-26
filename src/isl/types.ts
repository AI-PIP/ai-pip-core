/**
 * Types for ISL (Instruction Sanitization Layer) - Core Semántico
 */

// Importar tipos de CSL y value objects
import type { LineageEntry, TrustLevel } from '../csl/value-objects/index.js'
import type { PiDetectionResult } from './value-objects/PiDetectionResult.js'


/**
 * RiskScore
 *
 * Represents a normalized risk value produced by the core semantic layers.
 *
 * @remarks
 * - Value range is **0.0 to 1.0**
 * - `0`   = no risk detected
 * - `1`   = maximum risk confidence
 *
 * Although this type aliases `number`, it is intentionally defined
 * to preserve **semantic meaning**, enforce conceptual clarity,
 * and stabilize public contracts across layers and SDKs.
 *
 * This type MUST NOT be interpreted as a decision signal.
 * Decisions based on RiskScore belong to higher layers (AAL / SDK).
 */
export type RiskScore = number









/**
 * ISLSegment - Segmento sanitizado por ISL
 */
export interface ISLSegment {
  readonly id: string
  readonly originalContent: string        // Contenido original de CSL
  readonly sanitizedContent: string        // Contenido sanitizado
  readonly trust: TrustLevel               // Trust level del segmento original
  readonly lineage: LineageEntry[]         // Linaje actualizado con ISL
  readonly piDetection?: PiDetectionResult  // Detección de prompt injection
  readonly sanitizationLevel: 'minimal' | 'moderate' | 'aggressive'
}

/**
 * ISLResult - Resultado de la sanitización
 */
export interface ISLResult {
  readonly segments: readonly ISLSegment[]
  readonly lineage: readonly LineageEntry[]
  readonly metadata: {
    readonly totalSegments: number
    readonly sanitizedSegments: number
    readonly processingTimeMs?: number
  }
}

