/**
 * LineageEntry - tipo puro
 * 
 * @remarks
 * El core semántico solo preserva linaje estructural.
 * Notes libres son para observabilidad (SDK), no core.
 */
export type LineageEntry = {
  readonly step: string
  readonly timestamp: number
}

/**
 * Crea un LineageEntry - función pura
 * 
 * @remarks
 * El core solo registra step y timestamp.
 * Notes y metadata van en el SDK para observabilidad.
 */
export function createLineageEntry(step: string, timestamp: number): LineageEntry {
  if (!step || typeof step !== 'string' || step.trim().length === 0) {
    throw new Error('LineageEntry step must be a non-empty string')
  }

  if (typeof timestamp !== 'number' || timestamp < 0 || !Number.isFinite(timestamp)) {
    throw new Error('LineageEntry timestamp must be a valid positive number')
  }

  return {
    step: step.trim(),
    timestamp
  }
}
