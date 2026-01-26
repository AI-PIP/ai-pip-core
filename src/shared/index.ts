/**
 * Shared utilities for all layers - funciones puras compartidas
 * 
 * @remarks
 * Solo funciones básicas de manejo de linaje.
 * Auditoría y análisis avanzado van al SDK.
 */

// Lineage básico
export {
  addLineageEntry,
  addLineageEntries,
  filterLineageByStep,
  getLastLineageEntry
} from './lineage.js'


export type {
  Position,
  SegmentRef  
}from './types.js' 


