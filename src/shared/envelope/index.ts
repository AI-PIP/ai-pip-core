/**
 * Envelope (transversal) – integrity and anti-replay for pipeline results
 *
 * @remarks
 * CPE is a cross-cutting concern, not a layer. It wraps the output of the pipeline
 * (e.g. ISL or AAL result) with metadata, nonce, and HMAC-SHA256 signature.
 * Use `envelope(islResult, secretKey)` to produce a CPEResult; serialization
 * and verification are the responsibility of the SDK.
 */

export { envelope } from './envelope.js'
export { createNonce, isValidNonce, equalsNonce } from './value-objects/Nonce.js'
export type { Nonce } from './value-objects/Nonce.js'
export { createMetadata, isValidMetadata, CURRENT_PROTOCOL_VERSION } from './value-objects/Metadata.js'
export { createSignature, verifySignature, isValidSignatureFormat } from './value-objects/Signature.js'
export type { SignatureVO } from './value-objects/Signature.js'
export { EnvelopeError } from './exceptions/index.js'
export type {
  ProtocolVersion,
  Timestamp,
  NonceValue,
  SignatureAlgorithm,
  Signature,
  CPEMetadata,
  CPEEvelope,
  CPEResult,
} from './types.js'
