import type { HashAlgorithm } from '../types.js'

/**
 * ContentHash - tipo puro
 */
export type ContentHash = {
  readonly value: string
  readonly algorithm: HashAlgorithm
}

/**
 * Crea un ContentHash - función pura
 */
export function createContentHash(value: string, algorithm: HashAlgorithm = 'sha256'): ContentHash {
  if (!value || typeof value !== 'string') {
    throw new Error('ContentHash value must be a non-empty string')
  }

  if (!['sha256', 'sha512'].includes(algorithm)) {
    throw new Error(`Invalid HashAlgorithm: ${algorithm}. Must be 'sha256' or 'sha512'`)
  }

  const hexPattern = /^[a-f0-9]+$/i
  if (!hexPattern.test(value)) {
    throw new Error('ContentHash value must be a valid hexadecimal string')
  }

  const expectedLength = algorithm === 'sha256' ? 64 : 128
  if (value.length !== expectedLength) {
    throw new Error(`ContentHash value length must be ${expectedLength} characters for ${algorithm}`)
  }

  return {
    value: value.toLowerCase(),
    algorithm
  }
}

/**
 * Funciones puras para ContentHash
 */
export function isSha256(hash: ContentHash): boolean {
  return hash.algorithm === 'sha256'
}

export function isSha512(hash: ContentHash): boolean {
  return hash.algorithm === 'sha512'
}
