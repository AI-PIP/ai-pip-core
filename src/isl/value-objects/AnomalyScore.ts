import type { AnomalyAction, RiskScore } from '../types'

/**
 * AnomalyScore - tipo puro
 */
export type AnomalyScore = {
  readonly score: RiskScore
  readonly action: AnomalyAction
}

/**
 * Crea un AnomalyScore - función pura
 */
export function createAnomalyScore(score: RiskScore, action: AnomalyAction): AnomalyScore {
  if (score < 0 || score > 1) {
    throw new Error('Anomaly score must be a value between 0 and 1')
  }

  if (!['ALLOW', 'WARN', 'BLOCK'].includes(action)) {
    throw new Error(`Invalid AnomalyAction: ${action}. Must be one of: ALLOW, WARN, BLOCK`)
  }

  return { score, action }
}

/**
 * Funciones puras para AnomalyScore
 */
export function isHighRisk(anomaly: AnomalyScore): boolean {
  return anomaly.action === 'BLOCK'
}

export function isWarnRisk(anomaly: AnomalyScore): boolean {
  return anomaly.action === 'WARN'
}

export function isLowRisk(anomaly: AnomalyScore): boolean {
  return anomaly.action === 'ALLOW'
}

