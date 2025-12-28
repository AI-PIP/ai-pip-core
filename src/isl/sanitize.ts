import type { CSLResult } from '../csl/types'
import type { ISLResult, ISLSegment, RemovedInstruction } from './types'
import { createLineageEntry } from '../csl/value-objects'
import { addLineageEntry } from '../shared/lineage'
import type { TrustLevel } from '../csl/value-objects'
import { TrustLevelType } from '../csl/types'

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
  const blockedCount = 0
  let instructionsRemovedCount = 0

  for (const cslSegment of cslResult.segments) {
    // Determinar nivel de sanitización según trust level
    const sanitizationLevel = getSanitizationLevel(cslSegment.trust)

    // Sanitizar contenido según nivel
    const sanitized = sanitizeContent(
      cslSegment.content,
      sanitizationLevel
    )

    // Detectar instrucciones removidas (esto se implementará con detección de PI)
    const removedInstructions: RemovedInstruction[] = []

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
      instructionsRemoved: removedInstructions,
      sanitizationLevel
    }

    segments.push(islSegment)
    const lastLineageEntry = islSegment.lineage.at(-1)
    if (lastLineageEntry) {
      allLineage = addLineageEntry(allLineage, lastLineageEntry)
    }
    instructionsRemovedCount += removedInstructions.length
  }

  return {
    segments: Object.freeze(segments),
    lineage: Object.freeze(allLineage),
    metadata: {
      totalSegments: segments.length,
      sanitizedSegments: segments.length,
      blockedSegments: blockedCount,
      instructionsRemoved: instructionsRemovedCount
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
): { content: string; removed: RemovedInstruction[] } {
  // Por ahora retorna el contenido sin cambios
  // La lógica de sanitización real se implementará después
  return {
    content,
    removed: []
  }
}

