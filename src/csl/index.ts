/**
 * CSL (Context Segmentation Layer) - Core Semántico
 * 
 * @remarks
 * Este es el core semántico de CSL. Solo contiene:
 * - Funciones puras (sin estado)
 * - Value objects inmutables
 * - Tipos y excepciones
 * 
 * **NO contiene:**
 * - Detección de prompt injection (va a ISL)
 * - Políticas (van a ISL)
 * - Anomaly scores (van a ISL)
 * - Normalización agresiva (va a ISL)
 * - Servicios con estado (van al SDK)
 */

// Funciones puras principales
export { segment } from './segment'
export { classifySource, classifyOrigin } from './classify'
export { initLineage, createLineageEntry } from './lineage'

// Value objects
export type { TrustLevel, Origin, LineageEntry, ContentHash } from './value-objects'
export {
  createTrustLevel,
  isTrusted,
  isSemiTrusted,
  isUntrusted,
  createOrigin,
  isDom,
  isUser,
  isSystem,
  isInjected,
  isUnknown,
  isNetworkFetched,
  isExternal,
  isSha256,
  isSha512,
  originMap,
  createContentHash,
  validateOriginMap
} from './value-objects'

// Exceptions
export { ClassificationError } from './exceptions/ClassificationError'
export { SegmentationError } from './exceptions/SegmentationError'

// Types
export { OriginType, TrustLevelType } from './types'
export type { HashAlgorithm, Source, CSLInput, CSLSegment, CSLResult } from './types'

// Utils
export { generateId, splitByContextRules } from './utils'

