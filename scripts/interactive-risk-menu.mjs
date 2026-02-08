#!/usr/bin/env node
/**
 * Interactive menu to test Risk score → AAL decision (ALLOW / WARN / BLOCK) with colors.
 * Run after build: pnpm run demo-menu  (or: node scripts/interactive-risk-menu.mjs)
 */
import readline from 'node:readline'
import {
  createLineageEntry,
  createPiDetection,
  createPiDetectionResult,
  emitSignal,
  resolveAgentAction,
  getActionDisplayColor,
  RiskScoreStrategy,
  TrustLevelType
} from '../dist/index.js'
import { createTrustLevel } from '../dist/csl/index.js'
import { buildISLResult } from '../dist/isl/index.js'

const policy = Object.freeze({
  thresholds: { warn: 0.3, block: 0.7 },
  remediation: { enabled: true }
})

function buildSignalFromConfidence(confidence) {
  const n = Math.max(1, Math.round(confidence * 10))
  const det = createPiDetection('prompt-injection', 'x'.repeat(n), { start: 0, end: n }, confidence)
  const piResult = createPiDetectionResult([det])
  const lineage = [createLineageEntry('CSL', 1), createLineageEntry('ISL', 2)]
  const segment = {
    id: 'seg-1',
    originalContent: 'x',
    sanitizedContent: 'x',
    trust: createTrustLevel(TrustLevelType.STC),
    lineage,
    piDetection: piResult,
    sanitizationLevel: 'moderate'
  }
  const islResult = buildISLResult([segment], lineage)
  return emitSignal(islResult, { riskScore: { strategy: RiskScoreStrategy.MAX_CONFIDENCE } })
}

const ANSI = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  reset: '\x1b[0m'
}

function colorForAction(action) {
  const color = getActionDisplayColor(action)
  if (color === 'green') return ANSI.green
  if (color === 'yellow') return ANSI.yellow
  if (color === 'red') return ANSI.red
  return ANSI.reset
}

function runScenario(confidence) {
  const signal = buildSignalFromConfidence(confidence)
  const action = resolveAgentAction(signal, policy)
  const color = getActionDisplayColor(action)
  const ansi = colorForAction(action)
  console.log('')
  console.log(`${ANSI.dim}  Risk score:${ANSI.reset} ${signal.riskScore.toFixed(3)}`)
  console.log(`${ANSI.dim}  Policy:     warn >= 0.3, block >= 0.7${ANSI.reset}`)
  console.log(`${ANSI.dim}  Decision:   ${ANSI.reset}${ansi}${action}${ANSI.reset} (${color})`)
  console.log('')
}

function showMenu() {
  console.log('')
  console.log(`${ANSI.bold}  Risk score → AAL decision (ALLOW / WARN / BLOCK)${ANSI.reset}`)
  console.log(`${ANSI.dim}  Policy: warn >= 0.3, block >= 0.7${ANSI.reset}`)
  console.log('')
  console.log('  1. Low risk    (0.2) → ALLOW  (green)')
  console.log('  2. Medium risk (0.5) → WARN   (yellow)')
  console.log('  3. High risk   (0.8) → BLOCK  (red)')
  console.log('  4. Custom confidence (0–1)')
  console.log('  5. Exit')
  console.log('')
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log(`${ANSI.bold}@ai-pip/core — Interactive risk demo${ANSI.reset}`)
  showMenu()

  const choice = await prompt('  Option (1–5): ')
  const n = choice.replace(',', '.')

  if (n === '5' || choice.toLowerCase() === 'exit' || choice.toLowerCase() === 'q') {
    console.log('  Bye.')
    process.exit(0)
  }

  if (n === '1') {
    runScenario(0.2)
  } else if (n === '2') {
    runScenario(0.5)
  } else if (n === '3') {
    runScenario(0.8)
  } else if (n === '4') {
    const raw = await prompt('  Confidence (0–1): ')
    const c = parseFloat(raw.replace(',', '.'))
    if (Number.isFinite(c) && c >= 0 && c <= 1) {
      runScenario(c)
    } else {
      console.log('  Invalid number. Use 0–1.')
    }
  } else {
    const c = parseFloat(n)
    if (Number.isFinite(c) && c >= 0 && c <= 1) {
      runScenario(c)
    } else {
      console.log('  Unknown option. Use 1–5 or a number 0–1.')
    }
  }

  const again = await prompt('  Another run? (y/n): ')
  if (again.toLowerCase() === 'y' || again.toLowerCase() === 'yes') {
    main()
  } else {
    console.log('  Bye.')
    process.exit(0)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
