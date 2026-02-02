#!/usr/bin/env node
/**
 * Verifies risk score calculation with all strategies.
 * Run after build: node scripts/verify-risk-score.mjs
 * Or with tsx: pnpm exec tsx scripts/verify-risk-score.mjs (requires .ts and dist)
 */
import {
  getCalculator,
  RiskScoreStrategy,
  createLineageEntry,
  createPiDetection,
  createPiDetectionResult,
  emitSignal
} from '../dist/index.js'
import { buildISLResult } from '../dist/isl/index.js'

// Mock detections: 0.6, 0.8, 0.5
const detections = [
  createPiDetection('prompt-injection', 'ignore previous', { start: 0, end: 15 }, 0.6),
  createPiDetection('jailbreak', 'you are now', { start: 20, end: 31 }, 0.8),
  createPiDetection('role_hijacking', 'act as', { start: 40, end: 46 }, 0.5)
]

const piResult = createPiDetectionResult(detections)
const lineage = [createLineageEntry('CSL', 1), createLineageEntry('ISL', 2)]
const segment = {
  id: 'seg-1',
  originalContent: 'ignore previous. you are now. act as',
  sanitizedContent: 'ignore previous. you are now. act as',
  trust: { value: 'STC', label: 'Semi-Trusted Content' },
  lineage,
  piDetection: piResult,
  sanitizationLevel: 'moderate'
}
const islResult = buildISLResult([segment], lineage)

console.log('--- Risk score calculators (raw) ---')
const maxCalc = getCalculator(RiskScoreStrategy.MAX_CONFIDENCE)
const sevCalc = getCalculator(RiskScoreStrategy.SEVERITY_PLUS_VOLUME)
const weightedCalc = getCalculator(RiskScoreStrategy.WEIGHTED_BY_TYPE)

console.log('MAX_CONFIDENCE:', maxCalc.calculate(detections), '(expected: 0.8)')
console.log('SEVERITY_PLUS_VOLUME:', sevCalc.calculate(detections), '(expected: min(1, 0.8 + 0.2) = 1)')
console.log('WEIGHTED_BY_TYPE (default):', weightedCalc.calculate(detections))

console.log('\n--- emitSignal with each strategy ---')
const s1 = emitSignal(islResult, { riskScore: { strategy: RiskScoreStrategy.MAX_CONFIDENCE } })
const s2 = emitSignal(islResult, { riskScore: { strategy: RiskScoreStrategy.SEVERITY_PLUS_VOLUME } })
const s3 = emitSignal(islResult, { riskScore: { strategy: RiskScoreStrategy.WEIGHTED_BY_TYPE } })

console.log('MAX_CONFIDENCE signal.riskScore:', s1.riskScore, 'metadata:', s1.metadata?.strategy)
console.log('SEVERITY_PLUS_VOLUME signal.riskScore:', s2.riskScore, 'metadata:', s2.metadata?.strategy)
console.log('WEIGHTED_BY_TYPE signal.riskScore:', s3.riskScore, 'metadata:', s3.metadata?.strategy)

const ok =
  s1.riskScore === 0.8 &&
  s2.riskScore === 1 &&
  s1.metadata?.strategy === 'max-confidence' &&
  s2.metadata?.strategy === 'severity-plus-volume'
console.log(ok ? '\n✓ Risk score calculation OK' : '\n✗ Mismatch')
process.exit(ok ? 0 : 1)
