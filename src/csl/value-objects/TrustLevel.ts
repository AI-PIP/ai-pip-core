import { TrustLevelType } from '../types.js'

/**
 * TrustLevel - tipo puro
 */
export type TrustLevel = {
  readonly value: TrustLevelType
}

/**
 * Crea un TrustLevel - función pura
 */
export function createTrustLevel(value: TrustLevelType): TrustLevel {
  if (!Object.values(TrustLevelType).includes(value)) {
    throw new Error(`Invalid TrustLevel: ${value}`)
  }
  return { value }
}

/**
 * Funciones puras para TrustLevel
 */
export function isTrusted(trust: TrustLevel): boolean {
  return trust.value === TrustLevelType.TC
}

export function isSemiTrusted(trust: TrustLevel): boolean {
  return trust.value === TrustLevelType.STC
}

export function isUntrusted(trust: TrustLevel): boolean {
  return trust.value === TrustLevelType.UC
}
