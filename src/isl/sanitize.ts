import type { CSLResult } from '../csl/types.js'
import type { ISLResult, ISLSegment } from './types.js'
import { createLineageEntry } from '../csl/value-objects/index.js'
import { addLineageEntry } from '../shared/lineage.js'
import type { TrustLevel } from '../csl/value-objects/index.js'
import { TrustLevelType } from '../csl/types.js'

/**
 * Sanitiza contenido según nivel de confianza - función pura
 * 
 * @remarks
 * ISL aplica sanitización diferenciada según el trust level:
 * - TC: Sanitización mínima
 * - STC: Sanitización moderada
 * - UC: Sanitización agresiva
 */
export function sanitize(cslResult: CSLResult): ISLResult {
  const segments: ISLSegment[] = []
  let allLineage: typeof cslResult.lineage = [...cslResult.lineage]
  

  for (const cslSegment of cslResult.segments) {
    // Determinar nivel de sanitización según trust level
    const sanitizationLevel = getSanitizationLevel(cslSegment.trust)

    // Sanitizar contenido según nivel
    const sanitized = sanitizeContent(
      cslSegment.content,
      sanitizationLevel
    )


    // Crear segmento sanitizado
    const islSegment: ISLSegment = {
      id: cslSegment.id,
      originalContent: cslSegment.content,  // ✅ Preservar original
      sanitizedContent: sanitized.content,
      trust: cslSegment.trust,
      lineage: addLineageEntry(
        cslSegment.lineage,
        createLineageEntry('ISL', Date.now())
      ),
      sanitizationLevel
    }

    segments.push(islSegment)
    const lastLineageEntry = islSegment.lineage.at(-1)
    if (lastLineageEntry) {
      allLineage = addLineageEntry(allLineage, lastLineageEntry)
    }
  }

  return {
    segments: Object.freeze(segments),
    lineage: Object.freeze(allLineage),
    metadata: {
      totalSegments: segments.length,
      sanitizedSegments: segments.length,
    }
  }
}

/**
 * Determina nivel de sanitización según trust level - función pura
 */
function getSanitizationLevel(trust: TrustLevel): 'minimal' | 'moderate' | 'aggressive' {
  if (trust.value === TrustLevelType.TC) return 'minimal'
  if (trust.value === TrustLevelType.STC) return 'moderate'
  return 'aggressive'  // UC
}

/**
 * Sanitiza contenido según nivel - función pura
 */
function sanitizeContent(
  content: string,
  _level: 'minimal' | 'moderate' | 'aggressive'
): { content: string; } {
  // Por ahora retorna el contenido sin cambios
  // La lógica de sanitización real se implementará después
  return {
    content,
  }
}

