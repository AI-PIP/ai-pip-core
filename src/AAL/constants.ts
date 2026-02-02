/**
 * AAL display constants - semantic mapping for SDK/UI.
 * Used for consistent display of AAL decisions (e.g. colors).
 */

import type { AnomalyAction } from './types.js'

/**
 * Display color for each AAL action.
 * SDK/UI can use this for consistent styling (e.g. green = allow, yellow = warn, red = block).
 */
export const ACTION_DISPLAY_COLORS: Record<AnomalyAction, string> = Object.freeze({
  ALLOW: 'green',
  WARN: 'yellow',
  BLOCK: 'red'
})

/**
 * Returns the display color for an AAL action.
 */
export function getActionDisplayColor(action: AnomalyAction): string {
  return ACTION_DISPLAY_COLORS[action]
}
