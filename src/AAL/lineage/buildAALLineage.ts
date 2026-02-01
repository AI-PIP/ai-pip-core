/**
 * buildAALLineage - Builds AAL lineage
 * 
 * @remarks
 * This function builds and updates the AAL-specific lineage,
 * adding decision and action entries for auditing and traceability.
 * 
 * **Responsibility:**
 * - Build AAL lineage
 * - Add decision entries
 * - Preserve lineage from previous layers
 */

import type { LineageEntry } from '../../csl/value-objects/index.js'
import { createLineageEntry } from '../../csl/value-objects/index.js'
import { addLineageEntry } from '../../shared/lineage.js'

/**
 * Builds AAL lineage by adding a processing entry
 * 
 * @param previousLineage - Lineage from previous layers
 * @param timestamp - Processing timestamp (default: Date.now())
 * @returns Updated lineage with AAL entry
 */
export function buildAALLineage(
  previousLineage: readonly LineageEntry[],
  timestamp: number = Date.now()
): readonly LineageEntry[] {
  const aalEntry = createLineageEntry('AAL', timestamp)
  return addLineageEntry(previousLineage, aalEntry)
}
