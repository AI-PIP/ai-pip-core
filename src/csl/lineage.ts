import { createLineageEntry as createEntry } from './value-objects/LineageEntry'
import type { LineageEntry } from './value-objects/LineageEntry'
import type { CSLSegment } from './types'

/**
 * Inicializa el linaje para un segmento - función pura
 * 
 * @remarks
 * Crea la entrada inicial de linaje cuando se crea un segmento en CSL.
 * El core solo registra step y timestamp, sin notes.
 * 
 * @param segment - El segmento para el cual inicializar el linaje
 * @returns Array con la entrada inicial de linaje
 * 
 * @example
 * ```typescript
 * const lineage = initLineage(segment)
 * // Returns: [{ step: 'CSL', timestamp: ... }]
 * ```
 */
export function initLineage(_segment: CSLSegment): LineageEntry[] {
  return [
    createEntry('CSL', Date.now())
  ]
}

/**
 * Crea una entrada de linaje - función pura
 * 
 * @remarks
 * El core solo registra step y timestamp.
 * Notes y metadata van en el SDK para observabilidad.
 * 
 * @param step - Nombre del paso de procesamiento
 * @returns Nueva entrada de linaje
 */
export function createLineageEntry(step: string): LineageEntry {
  return createEntry(step, Date.now())
}

