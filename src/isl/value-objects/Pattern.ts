import type { RiskScore } from '../types.js'

/**
 * Pattern - tipo puro
 */
export type Pattern = {
  readonly pattern_type: string
  readonly regex: RegExp
  readonly base_confidence: RiskScore
  readonly description: string
}

/**
 * Constantes de seguridad para pattern matching
 */
export const MAX_CONTENT_LENGTH = 10_000_000 // 10MB
export const MAX_PATTERN_LENGTH = 10_000
export const MAX_MATCHES = 10_000

/**
 * Valida pattern_type - función pura
 */
function validatePatternType(pattern_type: unknown): asserts pattern_type is string {
  if (!pattern_type || typeof pattern_type !== 'string' || pattern_type.trim().length === 0) {
    throw new TypeError('Pattern pattern_type must be a non-empty string')
  }
}

/**
 * Valida regex - función pura
 */
function validateRegex(regex: unknown): asserts regex is string | RegExp {
  if (!regex || (typeof regex !== 'string' && !(regex instanceof RegExp))) {
    throw new TypeError('Pattern regex must be a string or a RegExp')
  }
}

/**
 * Valida base_confidence - función pura
 */
function validateBaseConfidence(base_confidence: unknown): asserts base_confidence is number {
  if (typeof base_confidence !== 'number' || !Number.isFinite(base_confidence)) {
    throw new TypeError('Pattern base_confidence must be a valid number')
  }

  if (base_confidence < 0 || base_confidence > 1) {
    throw new Error('Pattern base_confidence must be between 0 and 1')
  }
}

/**
 * Valida description - función pura
 */
function validateDescription(description: unknown): void {
  if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
    throw new TypeError('Pattern description must be a non-empty string if provided')
  }
}

/**
 * Compila regex string a RegExp - función pura
 */
function compileRegexString(regex: string): RegExp {
  try {
    return new RegExp(regex, 'i')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new TypeError(`Pattern regex must be a valid regular expression: ${regex}. Original error: ${errorMessage}`)
  }
}

/**
 * Clona RegExp - función pura
 */
function cloneRegExp(regex: RegExp): RegExp {
  return new RegExp(regex.source, regex.flags)
}

/**
 * Crea un Pattern - función pura
 */
export function createPattern(
  pattern_type: string,
  regex: string | RegExp,
  base_confidence: RiskScore,
  description?: string
): Pattern {
  // Validar inputs
  validatePatternType(pattern_type)
  validateRegex(regex)
  validateBaseConfidence(base_confidence)
  validateDescription(description)

  // Validar y procesar regex
  const regexSource = typeof regex === 'string' ? regex : regex.source
  
  if (regexSource.length > MAX_PATTERN_LENGTH) {
    throw new Error(`Pattern regex source exceeds maximum length of ${MAX_PATTERN_LENGTH} characters`)
  }

  // Normalizar regex a RegExp
  const normalizedRegex = typeof regex === 'string'
    ? compileRegexString(regex)
    : cloneRegExp(regex)

  return {
    pattern_type: pattern_type.trim(),
    regex: normalizedRegex,
    base_confidence,
    description: description?.trim() ?? ''
  }
}

/**
 * Funciones puras para Pattern matching
 */
export function matchesPattern(pattern: Pattern, content: string): boolean {
  if (!content || typeof content !== 'string') {
    throw new TypeError('Pattern.matches: content must be a non-empty string')
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error(
      `Pattern.matches: Content length (${content.length}) exceeds maximum allowed length (${MAX_CONTENT_LENGTH})`
    )
  }

  return pattern.regex.test(content)
}

export function findMatch(pattern: Pattern, content: string): {
  matched: string
  position: { start: number; end: number }
} | null {
  if (!content || typeof content !== 'string') {
    throw new TypeError('Pattern.findMatch: content must be a non-empty string')
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    throw new Error(
      `Pattern.findMatch: Content length (${content.length}) exceeds maximum allowed length (${MAX_CONTENT_LENGTH})`
    )
  }

  const match = pattern.regex.exec(content)
  if (match?.index === undefined) {
    return null
  }

  return {
    matched: match[0],
    position: {
      start: match.index,
      end: match.index + match[0].length
    }
  }
}

