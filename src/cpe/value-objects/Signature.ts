/**
 * Signature - Firma criptográfica HMAC-SHA256
 * Value Object puro e inmutable
 */

import { createHmac } from 'node:crypto'
import type { SignatureAlgorithm } from '../types'

/**
 * Signature - Firma criptográfica
 */
export type SignatureVO = {
  readonly value: string
  readonly algorithm: SignatureAlgorithm
}

/**
 * Genera una firma HMAC-SHA256 del contenido
 * 
 * @param content - Contenido a firmar
 * @param secretKey - Clave secreta para HMAC
 * @returns Signature inmutable
 * 
 * @throws {Error} Si la clave secreta está vacía
 */
export function createSignature(
  content: string,
  secretKey: string
): SignatureVO {
  if (!secretKey || secretKey.length === 0) {
    throw new Error('Secret key is required for signature generation')
  }

  if (typeof content !== 'string') {
    throw new TypeError('Content must be a string')
  }

  const hmac = createHmac('sha256', secretKey)
  hmac.update(content)
  const signature = hmac.digest('hex')

  return Object.freeze({
    value: signature,
    algorithm: 'HMAC-SHA256',
  })
}

/**
 * Verifica una firma HMAC-SHA256
 * 
 * @param content - Contenido original
 * @param signature - Firma a verificar
 * @param secretKey - Clave secreta para HMAC
 * @returns true si la firma es válida
 */
export function verifySignature(
  content: string,
  signature: string,
  secretKey: string
): boolean {
  if (!secretKey || secretKey.length === 0) {
    return false
  }

  try {
    const expectedSignature = createSignature(content, secretKey)
    return expectedSignature.value === signature
  } catch {
    return false
  }
}

/**
 * Valida el formato de una firma
 * 
 * @param signature - Firma a validar
 * @returns true si el formato es válido
 */
export function isValidSignatureFormat(signature: string): boolean {
  // HMAC-SHA256 produce un hash hexadecimal de 64 caracteres
  return /^[a-f0-9]{64}$/i.test(signature)
}

