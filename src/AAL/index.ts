
/**
 * AAL (Agent Action Lock) - Core Semántico 
 * 
 * @remarks
 * Este es el core semántico de AAL. Solo contiene:
 * - Funciones puras (sin estado)
 * - Value objects inmutables
 * - Tipos
 * 
 * **NO contiene:**
 * - Detección de prompt injection (va a ISL)
 * - Políticas (van a ISL)
 * - Anomaly scores (van a ISL)
 * - Normalización agresiva (va a ISL)
 * - Servicios con estado (van al SDK)
 */

export {
    createAnomalyScore,
    AnomalyScore,
    isHighRisk,
    isLowRisk,
    isWarnRisk,
    isRoleProtected,
    isContextLeakPreventionEnabled,
    isInstructionImmutable,
    isIntentBlocked,
    isScopeSensitive
} from './value-objects/index.js'

export type {
    AnomalyAction,
    RemovedInstruction,
    BlockedIntent,
    SensitiveScope,
    ProtectedRole,
    ImmutableInstruction
} from './types.js'