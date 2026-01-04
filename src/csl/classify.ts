import { createTrustLevel } from './value-objects/TrustLevel.js'
import type { Origin } from './value-objects/Origin.js'
import { originMap } from './value-objects/Origin-map.js'
import { ClassificationError } from './exceptions/index.js'
import { OriginType } from './types.js'
import type { Source } from './types.js'

/**
 * Clasifica un source y retorna su TrustLevel - función pura determinista
 * 
 * @remarks
 * - 100% determinista: mismo source → mismo trust level, siempre
 * - Sin efectos secundarios: función pura
 * - Sin análisis de contenido: solo el source importa
 * 
 * @param source - El source del contenido ('DOM' | 'UI' | 'SYSTEM' | 'API')
 * @returns TrustLevel determinado por el source
 * 
 * @throws {ClassificationError} Si el source no puede ser clasificado
 * 
 * @example
 * ```typescript
 * const trust = classifySource('UI')
 * // Returns: { value: 'STC' }
 * 
 * const trust2 = classifySource('DOM')
 * // Returns: { value: 'UC' }
 * ```
 */
export function classifySource(source: Source) {
  // Mapeo simple: Source → OriginType → TrustLevel
  const sourceToOriginType: Record<Source, OriginType> = {
    'SYSTEM': OriginType.SYSTEM_GENERATED,   // System → TC
    'UI': OriginType.DOM_VISIBLE,             // UI → STC
    'API': OriginType.DOM_ATTRIBUTE,          // API → STC
    'DOM': OriginType.DOM_HIDDEN              // DOM/WEB/SCRAPED → UC
  }
  
  const originType = sourceToOriginType[source]
  
  if (!originType) {
    throw new ClassificationError(`Source '${source}' cannot be classified`)
  }
  
  const trustLevelType = originMap.get(originType)
  
  if (!trustLevelType) {
    throw new ClassificationError(
      `Origin type '${originType}' is not mapped in originMap. ` +
      `All OriginType values must have a corresponding TrustLevel mapping.`
    )
  }
  
  return createTrustLevel(trustLevelType)
}

/**
 * Clasifica un Origin y retorna su TrustLevel - función pura determinista
 * 
 * @param origin - El Origin value object
 * @returns TrustLevel determinado por el origin
 * 
 * @throws {ClassificationError} Si el origin no está mapeado
 */
export function classifyOrigin(origin: Origin) {
  const trustLevelType = originMap.get(origin.type)
  
  if (!trustLevelType) {
    throw new ClassificationError(
      `Origin type '${origin.type}' is not mapped in originMap. ` +
      `All OriginType values must have a corresponding TrustLevel mapping.`
    )
  }
  
  return createTrustLevel(trustLevelType)
}

