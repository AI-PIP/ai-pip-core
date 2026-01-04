import type { LineageEntry } from '../csl/value-objects/index.js'

/**
 * Lineage global - funciones puras para manejar linaje entre capas
 * 
 * @remarks
 * El linaje es compartido entre todas las capas (CSL, ISL, CPE, etc.)
 * Cada capa puede agregar entradas al linaje de un segmento.
 */

/**
 * Agrega una entrada de linaje a un array existente - función pura
 * 
 * @param lineage - Array de entradas de linaje existentes
 * @param entry - Nueva entrada a agregar
 * @returns Nuevo array con la entrada agregada
 */
export function addLineageEntry(
  lineage: readonly LineageEntry[],
  entry: LineageEntry
): LineageEntry[] {
  return [...lineage, entry]
}

/**
 * Agrega múltiples entradas de linaje - función pura
 */
export function addLineageEntries(
  lineage: readonly LineageEntry[],
  entries: readonly LineageEntry[]
): LineageEntry[] {
  return [...lineage, ...entries]
}

/**
 * Filtra entradas de linaje por step - función pura
 */
export function filterLineageByStep(
  lineage: readonly LineageEntry[],
  step: string
): LineageEntry[] {
  return lineage.filter(entry => entry.step === step)
}

/**
 * Obtiene la última entrada de linaje - función pura
 */
export function getLastLineageEntry(
  lineage: readonly LineageEntry[]
): LineageEntry | undefined {
  return lineage.length > 0 ? lineage.at(-1) : undefined
}

