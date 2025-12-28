/**
 * Utility functions for CSL - funciones puras
 */

/**
 * Generates a unique ID for a segment
 */
export function generateId(): string {
  return `seg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Splits content by context rules - función pura de segmentación
 * 
 * @remarks
 * Segmentación básica por líneas. Sin normalización agresiva
 * (la normalización va a ISL).
 */
export function splitByContextRules(content: string): string[] {
  if (content.length === 0) {
    return []
  }
  
  // Segmentación básica por líneas
  return content
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

