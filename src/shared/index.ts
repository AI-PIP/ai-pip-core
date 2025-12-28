/**
 * Shared utilities for all layers - funciones puras compartidas
 * 
 * @remarks
 * Solo funciones básicas de manejo de linaje.
 * Auditoría y análisis avanzado van al SDK.
 */

// Lineage básico
export * from './lineage'

// Funciones de auditoría NO son core - van al SDK/tooling
// El core solo preserva linaje, no lo analiza
