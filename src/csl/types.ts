/**
 * Types for CSL (Context Segmentation Layer) - Core Semántico
 * 
 * Solo tipos esenciales para CSL. Tipos relacionados con detección,
 * anomalías y políticas van a ISL.
 */

/**
 * OriginType represents the deterministic source of a content segment.
 */
export enum OriginType {
  /**
   * Direct user input from UI controls
   * Always classified as UC (Untrusted Content) for security.
   */
  USER = 'USER',
  
  /**
   * Content from visible DOM elements
   * Classified as STC (Semi-Trusted Content) because user can verify it.
   */
  DOM_VISIBLE = 'DOM_VISIBLE',
  
  /**
   * Content from hidden DOM elements
   * Classified as UC (Untrusted Content) - potential attack vector.
   */
  DOM_HIDDEN = 'DOM_HIDDEN',
  
  /**
   * Content from DOM attributes (data-*, aria-*, etc.)
   * Classified as STC (Semi-Trusted Content) - visible in source.
   */
  DOM_ATTRIBUTE = 'DOM_ATTRIBUTE',
  
  /**
   * Content injected by scripts (dynamically generated)
   * Classified as UC (Untrusted Content) - can be manipulated.
   */
  SCRIPT_INJECTED = 'SCRIPT_INJECTED',
  
  /**
   * Content fetched from network (API calls, external resources)
   * Classified as UC (Untrusted Content) - external source, not verified.
   */
  NETWORK_FETCHED = 'NETWORK_FETCHED',
  
  /**
   * System-generated content (instructions, system prompts, etc.)
   * Classified as TC (Trusted Content) - system controls this content.
   */
  SYSTEM_GENERATED = 'SYSTEM_GENERATED',
  
  /**
   * Origin cannot be determined
   * Classified as UC (Untrusted Content) - unknown is untrusted by default.
   */
  UNKNOWN = 'UNKNOWN',
}

/**
 * TrustLevelType represents the trust level of content
 */
export enum TrustLevelType {
  TC = 'TC',   // Trusted Content
  STC = 'STC', // Semi-Trusted Content
  UC = 'UC',   // Untrusted Content
}

/**
 * HashAlgorithm for ContentHash (opcional, para trazabilidad)
 */
export type HashAlgorithm = 'sha256' | 'sha512'

/**
 * Source type for CSL input
 */
export type Source = 'DOM' | 'UI' | 'SYSTEM' | 'API'

/**
 * CSLInput - Input para la función segment()
 */
export interface CSLInput {
  readonly content: string
  readonly source: Source
  readonly metadata?: Record<string, unknown>
}

// Importar tipos de value objects para usar en interfaces
import type { ContentHash, LineageEntry, TrustLevel } from './value-objects'

/**
 * CSLSegment - Segmento puro, solo datos semánticos
 */
export interface CSLSegment {
  readonly id: string
  readonly content: string              // Original, sin modificar
  readonly source: Source
  readonly trust: TrustLevel            // Clasificado por origen
  readonly lineage: LineageEntry[]     // Inicializado en CSL
  readonly hash?: ContentHash           // Opcional, para trazabilidad
  readonly metadata?: Record<string, unknown>
}

/**
 * CSLResult - Resultado puro, solo datos
 */
export interface CSLResult {
  readonly segments: readonly CSLSegment[]
  readonly lineage: readonly LineageEntry[]
  readonly processingTimeMs?: number    // Opcional, para métricas
}

