#!/usr/bin/env node
/**
 * Scan content from scan-content-raw.txt → segment → sanitize → remediation plan.
 * Writes scan-result-removal.txt with remediation plan (strategy, goals, constraints,
 * targetSegments) and segment content for target segments. The SDK/AI agent performs
 * actual cleanup using this plan.
 * Run after build: pnpm build && node scripts/scan-removal.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  segment,
  sanitize,
  buildRemediationPlan
} from '../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const INPUT_FILE = path.join(ROOT, 'scan-content-raw.txt')
const OUTPUT_FILE = path.join(ROOT, 'scan-result-removal.txt')

const policy = Object.freeze({
  thresholds: { warn: 0.3, block: 0.7 },
  remediation: { enabled: true }
})

function main() {
  let raw
  try {
    raw = fs.readFileSync(INPUT_FILE, 'utf8')
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Missing input file:', INPUT_FILE)
      process.exit(1)
    }
    throw err
  }

  const cslResult = segment({ content: raw, source: 'UI', metadata: {} })
  const islResult = sanitize(cslResult)
  const plan = buildRemediationPlan(islResult, policy)

  const lines = []
  lines.push('# Remediation plan (SDK/AI agent performs cleanup)')
  lines.push(`# Input: ${INPUT_FILE}`)
  lines.push(`# Segments: ${islResult.segments.length}`)
  lines.push(`# Strategy: ${plan.strategy}`)
  lines.push(`# Needs remediation: ${plan.needsRemediation}`)
  lines.push(`# Target segment IDs: ${plan.targetSegments.join(', ')}`)
  lines.push(`# Goals: ${plan.goals.join(', ')}`)
  lines.push(`# Constraints: ${plan.constraints.join(', ')}`)
  lines.push('')
  lines.push('--- Segment content for target segments (for SDK cleanup) ---')
  lines.push('')

  const targetSet = new Set(plan.targetSegments)
  for (let i = 0; i < islResult.segments.length; i++) {
    const seg = islResult.segments[i]
    if (!targetSet.has(seg.id)) continue
    lines.push(`--- Segment ${i + 1} (id=${seg.id}) ---`)
    lines.push(seg.sanitizedContent)
    lines.push('')
  }

  fs.writeFileSync(OUTPUT_FILE, lines.join('\n'), 'utf8')
  console.log('Written:', OUTPUT_FILE)
  console.log('Segments:', islResult.segments.length, '| Target segments:', plan.targetSegments.length, '| Needs remediation:', plan.needsRemediation)
}

main()
