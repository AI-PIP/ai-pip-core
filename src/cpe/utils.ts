/**
 * Utilidades puras para CPE
 */

/**
 * Serializa el contenido sanitizado de ISL para firma
 * 
 * @param segments - Segmentos sanitizados
 * @returns Contenido serializado
 */
export function serializeContent(segments: readonly { readonly sanitizedContent: string }[]): string {
  return segments
    .map((segment, index) => `[${index}]:${segment.sanitizedContent}`)
    .join('\n')
}

/**
 * Serializa metadata para firma
 * 
 * @param metadata - Metadata a serializar
 * @returns Metadata serializada
 */
export function serializeMetadata(metadata: {
  readonly timestamp: number
  readonly nonce: string
  readonly protocolVersion: string
  readonly previousSignatures?: {
    readonly csl?: string | undefined
    readonly isl?: string | undefined
  } | undefined
}): string {
  const parts = [
    `timestamp:${metadata.timestamp}`,
    `nonce:${metadata.nonce}`,
    `version:${metadata.protocolVersion}`,
  ]

  if (metadata.previousSignatures?.csl) {
    parts.push(`csl:${metadata.previousSignatures.csl}`)
  }

  if (metadata.previousSignatures?.isl) {
    parts.push(`isl:${metadata.previousSignatures.isl}`)
  }

  return parts.join('|')
}

/**
 * Genera el contenido completo para firma
 * Según spec: contenido procesado + metadata + identificador del algoritmo
 * 
 * @param content - Contenido serializado (payload semántico)
 * @param metadata - Metadata serializada
 * @param algorithm - Identificador del algoritmo de firma
 * @returns Contenido completo para firma
 */
export function generateSignableContent(
  content: string,
  metadata: string,
  algorithm: string
): string {
  return `${metadata}\n---\n${content}\n---\nalgorithm:${algorithm}`
}

