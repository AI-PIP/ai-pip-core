import type { Position } from "../shared/types.js"

/**
 * AnomalyAction - Acción recomendada basada en análisis
 */
export type AnomalyAction = 'ALLOW' | 'WARN' | 'BLOCK'

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