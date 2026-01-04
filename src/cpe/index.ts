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
export { envelope } from './envelope.js'

// Value objects
export { createNonce, isValidNonce, equalsNonce } from './value-objects/Nonce.js'
export type { Nonce } from './value-objects/Nonce.js'
export { createMetadata, isValidMetadata, CURRENT_PROTOCOL_VERSION } from './value-objects/Metadata.js'
export { createSignature } from './value-objects/Signature.js'
export type { SignatureVO } from './value-objects/Signature.js'

// Exceptions
export { EnvelopeError } from './exceptions/EnvelopeError.js'

// Types
export type {
  ProtocolVersion,
  Timestamp,
  NonceValue,
  SignatureAlgorithm,
  Signature,
  CPEMetadata,
  CPEEvelope,
  CPEResult
} from './types.js'

// Serialización y verificación NO son core - van al SDK
// El core solo define la estructura del envelope, no implementa serialización

