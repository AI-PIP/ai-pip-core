/**
 * Types for ISL (Instruction Sanitization Layer) - Core Semántico
 */

// Importar tipos de CSL y value objects
import type { LineageEntry, TrustLevel } from '../csl/value-objects'
import type { PiDetectionResult } from './value-objects/PiDetectionResult'
import type { AnomalyScore } from './value-objects/AnomalyScore'

/**
 * RiskScore - Score de riesgo (0-1)
 */
export type RiskScore = number

/**
 * AnomalyAction - Acción recomendada basada en análisis
 */
export type AnomalyAction = 'ALLOW' | 'WARN' | 'BLOCK'

/**
 * Position - Posición de un patrón detectado en el contenido
 */
export type Position = {
  readonly start: number
  readonly end: number
}

/**
 * BlockedIntent - Intent que está explícitamente bloqueado por política
 */
export type BlockedIntent = string

/**
 * SensitiveScope - Tema sensible que requiere validación adicional
 */
export type SensitiveScope = string

/**
 * ProtectedRole - Rol que no puede ser sobrescrito
 */
export type ProtectedRole = string

/**
 * ImmutableInstruction - Instrucción que no puede ser modificada
 */
export type ImmutableInstruction = string

/**
 * RemovedInstruction - Instrucción removida durante sanitización
 */
export interface RemovedInstruction {
  readonly type: 'system_command' | 'role_swapping' | 'jailbreak' | 'override' | 'manipulation'
  readonly pattern: string
  readonly position: Position
  readonly description: string
}

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
  readonly anomalyScore?: AnomalyScore     // Score de anomalía
  readonly instructionsRemoved: RemovedInstruction[]  // Instrucciones removidas
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
    readonly blockedSegments: number
    readonly instructionsRemoved: number
    readonly processingTimeMs?: number
  }
}

