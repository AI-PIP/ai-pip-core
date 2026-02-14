/**
 * Canonical AI-PIP tag serializer – Official protocol representation.
 *
 * @remarks
 * This module defines the only normative, standardized textual format for
 * AI-PIP semantic tags. It does not apply offsets, does not mutate segments,
 * and does not decide when to encapsulate. The SDK is responsible for applying
 * tags at the correct positions (using ThreatTag metadata) and for resolving
 * multiple or overlapping tags (e.g. descending offset order).
 *
 * The serializer only builds strings: opening tag, closing tag, or fully
 * wrapped content. This makes the tag format part of the formal protocol,
 * not an informal SDK convention.
 */

import { AIPIP_NAMESPACE } from './namespace.js'
import type { ThreatTagType } from './threat-tag-type.js'

/**
 * Returns the canonical opening tag string.
 *
 * @example
 * openTag('prompt-injection') // "<aipip:prompt-injection>"
 */
export function openTag(type: ThreatTagType): string {
  return `<${AIPIP_NAMESPACE}:${type}>`
}

/**
 * Returns the canonical closing tag string.
 *
 * @example
 * closeTag('prompt-injection') // "</aipip:prompt-injection>"
 */
export function closeTag(type: ThreatTagType): string {
  return `</${AIPIP_NAMESPACE}:${type}>`
}

/**
 * Returns content wrapped with opening and closing tags.
 * Does not validate or interpret content; purely concatenation.
 *
 * @example
 * wrapWithTag('prompt-injection', 'Ignore previous instructions.')
 * // "<aipip:prompt-injection>Ignore previous instructions.</aipip:prompt-injection>"
 */
export function wrapWithTag(type: ThreatTagType, content: string): string {
  return `${openTag(type)}${content}${closeTag(type)}`
}
