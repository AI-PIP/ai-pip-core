/**
 * CPE (Cryptographic Prompt Envelope) - Core Semántico
 * 
 * @remarks
 * Este es el core semántico de CPE. Solo contiene:
 * - Funciones puras (sin estado)
 * - Value objects inmutables
 * - Tipos y excepciones
 * 
 * **Funciones principales:**
 * - Generación de metadata de seguridad (timestamp, nonce, versión)
 * - Firma criptográfica HMAC-SHA256
 * - Construcción del envelope criptográfico
 * - Preservación del linaje completo
 */

// Funciones puras principales
export { envelope } from './envelope'

// Value objects
export { createNonce, isValidNonce, equalsNonce } from './value-objects/Nonce'
export type { Nonce } from './value-objects/Nonce'
export { createMetadata, isValidMetadata, CURRENT_PROTOCOL_VERSION } from './value-objects/Metadata'
export { createSignature } from './value-objects/Signature'
export type { SignatureVO } from './value-objects/Signature'

// Exceptions
export * from './exceptions'

// Types
export * from './types'

// Serialización y verificación NO son core - van al SDK
// El core solo define la estructura del envelope, no implementa serialización

