/**
 * Nonce - Valor único para prevenir ataques de replay
 * Value Object puro e inmutable
 */

import { randomBytes } from 'node:crypto'

/**
 * Nonce - Valor único generado aleatoriamente
 */
export type Nonce = {
  readonly value: string
}

/**
 * Genera un nonce único
 * 
 * @param length - Longitud del nonce en bytes (default: 16)
 * @returns Nonce único
 */
export function createNonce(length: number = 16): Nonce {
  if (length < 8) {
    throw new Error('Nonce length must be at least 8 bytes')
  }
  if (length > 64) {
    throw new Error('Nonce length must be at most 64 bytes')
  }

  const bytes = randomBytes(length)
  const value = bytes.toString('hex')

  return Object.freeze({
    value,
  })
}

/**
 * Valida que un string sea un nonce válido
 * 
 * @param value - String a validar
 * @returns true si es un nonce válido
 */
export function isValidNonce(value: string): boolean {
  return /^[a-f0-9]{16,128}$/i.test(value)
}

/**
 * Compara dos nonces
 * 
 * @param nonce1 - Primer nonce
 * @param nonce2 - Segundo nonce
 * @returns true si son iguales
 */
export function equalsNonce(nonce1: Nonce, nonce2: Nonce): boolean {
  return nonce1.value === nonce2.value
}

