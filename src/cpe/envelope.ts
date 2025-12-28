/**
 * Genera el envoltorio criptográfico (CPEEvelope) - función pura principal de CPE
 * 
 * @remarks
 * Esta es la función principal de CPE. Genera un envoltorio criptográfico
 * que garantiza la integridad y autenticidad del prompt procesado.
 * 
 * **Funciones:**
 * - Genera metadata de seguridad (timestamp, nonce, versión)
 * - Firma criptográficamente el contenido con HMAC-SHA256
 * - Encapsula el contenido sanitizado con metadata
 * - Preserva el linaje completo para auditoría
 * 
 * @param islResult - Resultado de ISL con contenido sanitizado
 * @param secretKey - Clave secreta para HMAC (debe ser proporcionada por el SDK)
 * @returns CPEResult con el envelope criptográfico
 * 
 * @throws {EnvelopeError} Si la generación del envelope falla
 * 
 * @example
 * ```typescript
 * const cpeResult = envelope(islResult, secretKey)
 * 
 * // cpeResult.envelope contiene:
 * // - content: contenido sanitizado serializado
 * // - signature: firma HMAC-SHA256
 * // - metadata: timestamp, nonce, versión
 * // - lineage: linaje completo
 * ```
 */
import type { ISLResult } from '@/isl/types'
import type { CPEEvelope, CPEResult } from './types'
import { createNonce } from './value-objects/Nonce'
import { createMetadata } from './value-objects/Metadata'
import { createSignature } from './value-objects/Signature'
import { EnvelopeError } from './exceptions'
// Serialización NO es core - va al SDK
// El core solo define la estructura del envelope
import { addLineageEntries } from '@/shared/lineage'
import { createLineageEntry } from '@/csl/value-objects/LineageEntry'

export function envelope(islResult: ISLResult, secretKey: string): CPEResult {
  const startTime = Date.now()

  try {
    // 1. Validar input
    if (!islResult?.segments?.length) {
      throw new EnvelopeError('ISLResult must contain at least one segment')
    }

    if (!secretKey || secretKey.length === 0) {
      throw new EnvelopeError('Secret key is required for envelope generation')
    }

    // 2. Generar metadata de seguridad
    const timestamp = Date.now()
    const nonce = createNonce()
    const metadata = createMetadata(timestamp, nonce)

    // 3. Preparar payload semántico (contenido procesado por ISL)
    // El payload puede ser cualquier estructura que represente el contenido procesado
    const payload: unknown = {
      segments: islResult.segments.map((segment) => ({
        id: segment.id,
        content: segment.sanitizedContent,
        trust: segment.trust.value,
        sanitizationLevel: segment.sanitizationLevel,
      })),
    }

    // 4. Generar firma criptográfica HMAC-SHA256
    // Nota: La serialización del contenido para firma debe hacerse en el SDK
    // El core solo define que se debe firmar el payload + metadata
    // Por ahora, serializamos de forma básica para mantener funcionalidad
    
    const algorithm = 'HMAC-SHA256'
    const signableContent = JSON.stringify({
      payload,
      metadata,
      algorithm
    })
    const signatureVO = createSignature(signableContent, secretKey)

    // 5. Actualizar linaje con entrada CPE
    const cpeLineageEntry = createLineageEntry('CPE', timestamp)
    const updatedLineage = addLineageEntries(islResult.lineage, [cpeLineageEntry])

    // 9. Construir envelope según especificación
    const envelope: CPEEvelope = {
      payload,
      metadata,
      signature: {
        value: signatureVO.value,
        algorithm: signatureVO.algorithm,
      },
      lineage: updatedLineage,
    }

    const processingTime = Date.now() - startTime

    return {
      envelope,
      processingTimeMs: processingTime,
    }
  } catch (error) {
    if (error instanceof EnvelopeError) {
      throw error
    }
    throw new EnvelopeError(
      `Failed to generate envelope: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined
    )
  }
}

