/**
 * buildISLLineage - Builds ISL lineage
 * 
 * @remarks
 * This function builds and updates the ISL-specific lineage,
 * adding processing entries for auditing and traceability.
 * 
 * **Responsibility:**
 * - Build ISL lineage
 * - Add processing entries
 * - Preserve lineage from previous layers
 */

import type { LineageEntry } from '../../csl/value-objects/index.js'
import { createLineageEntry } from '../../csl/value-objects/index.js'
import { addLineageEntry } from '../../shared/lineage.js'

/**
 * Builds ISL lineage by adding a processing entry
 * 
 * @param previousLineage - Lineage from previous layers
 * @param timestamp - Processing timestamp (default: Date.now())
 * @returns Updated lineage with ISL entry
 */
export function buildISLLineage(
  previousLineage: readonly LineageEntry[],
  timestamp: number = Date.now()
): readonly LineageEntry[] {
  const islEntry = createLineageEntry('ISL', timestamp)
  return addLineageEntry(previousLineage, islEntry)
}
