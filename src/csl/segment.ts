import type { CSLInput, CSLResult, CSLSegment } from './types.js'
import { classifySource } from './classify.js'
import { initLineage } from './lineage.js'
import { generateId, splitByContextRules } from './utils.js'
import { SegmentationError } from './exceptions/index.js'

/**
 * Segmenta input en segmentos semánticos - función pura principal de CSL
 * 
 * @remarks
 * Esta es la función principal de CSL. Segmenta el contenido, clasifica
 * por origen, e inicializa el linaje. Todo de forma pura y determinista.
 * 
 * **Invariantes preservados:**
 * - El contenido original nunca se pierde
 * - El orden de segmentos es estable
 * - Todo segmento tiene linaje inicial
 * - CSL es determinista
 * 
 * @param input - Input con contenido y source
 * @returns CSLResult con segmentos clasificados y linaje inicializado
 * 
 * @throws {SegmentationError} Si la segmentación falla
 * 
 * @example
 * ```typescript
 * const result = segment({
 *   content: 'Hello\nWorld',
 *   source: 'UI',
 *   metadata: {}
 * })
 * 
 * // result.segments contiene 2 segmentos, cada uno con:
 * // - content original
 * // - trust level clasificado
 * // - lineage inicializado
 * ```
 */
export function segment(input: CSLInput): CSLResult {
  try {
    // 1. Validar input
    if (!input.content || typeof input.content !== 'string') {
      throw new SegmentationError('CSLInput content must be a non-empty string')
    }

    if (!input.source) {
      throw new SegmentationError('CSLInput source is required')
    }

    // 2. Dividir contenido en segmentos estructurales (función pura)
    // CSL solo segmenta por estructura, no por intención semántica
    const contentSegments = splitByContextRules(input.content)

    // 3. Si no hay contenido, retornar resultado vacío
    if (contentSegments.length === 0) {
      return {
        segments: Object.freeze([]),
        lineage: Object.freeze([])
      }
    }

    // 4. Clasificar source una vez (determinista)
    const trust = classifySource(input.source)

    // 5. Crear segmentos con clasificación y linaje
    const segments: CSLSegment[] = contentSegments.map((content) => {
      // Crear segmento temporal para inicializar linaje
      const tempSegment: CSLSegment = {
        id: generateId(),
        content,                    // ✅ Original preservado
        source: input.source,       // ✅ Origen preservado
        trust,                      // ✅ Clasificación determinista
        lineage: [],                // Se inicializa después
        ...(input.metadata && { metadata: input.metadata })
      }
      
      // Inicializar linaje
      const lineage = initLineage(tempSegment)
      
      // Retornar segmento completo
      return {
        ...tempSegment,
        lineage                      // ✅ Linaje inicializado
      }
    })

    // 6. Recolectar todo el linaje
    const allLineage = segments.flatMap(s => s.lineage)

    // 7. Retornar resultado puro
    return {
      segments: Object.freeze(segments),
      lineage: Object.freeze(allLineage)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error during segmentation'
    throw new SegmentationError(`Failed to segment content: ${errorMessage}`, error)
  }
}

