/**
 * ISL (Instruction Sanitization Layer) - Core Semántico
 * 
 * @remarks
 * ISL sanitiza instrucciones maliciosas recibidas de CSL,
 * aplicando diferentes niveles de sanitización según el nivel de confianza.
 */

// Funciones puras principales
export { sanitize } from './sanitize'

// Value objects
export * from './value-objects'

// Exceptions
export * from './exceptions'

// Types
export * from './types'

