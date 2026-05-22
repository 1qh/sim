#!/usr/bin/env bun
/** biome-ignore-all lint/nursery/noContinue: noise */
/* eslint-disable no-continue, no-console */
import { $, argv, file } from 'bun'
import { createHash } from 'node:crypto'
import process from 'node:process'

const mode = argv[2] ?? 'green'
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const ledgerPath = `${repoRoot}/ledger.jsonl`
const treeRaw =
  (await $`git ls-files -s -- ":!apps/backend/convex/_generated/*" ":!tools/ledger/*"`.text()) +
  (await $`git diff -- ":!apps/backend/convex/_generated/*" ":!tools/ledger/*"`.text())
const tree = createHash('sha256').update(treeRaw).digest('hex').slice(0, 16)
const text = await file(ledgerPath)
  .text()
  .catch(() => '')
interface Row {
  commit: string
  durationMs: number
  gate: string
  notes: string
  status: string
  tree: string
  ts: string
}
const rows: Row[] = []
for (const line of text.split('\n')) {
  if (!line.trim()) continue
  try {
    rows.push(JSON.parse(line) as Row)
  } catch (parseError) {
    console.error(`skip malformed row: ${(parseError as Error).message}`)
  }
}
const byGate = new Map<string, Row>()
for (const r of rows) if (r.tree === tree) byGate.set(r.gate, r)
const knownGreen = [...byGate.values()].filter(r => r.status === 'pass')
const knownFail = [...byGate.values()].filter(r => r.status !== 'pass')
const knownGates = new Set(byGate.keys())
const expected = new Set<string>()
const verifyPath = `${repoRoot}/../simdocs/VERIFY.md`
const verify = await file(verifyPath)
  .text()
  .catch(() => '')
const gatePattern = /^- \[[ x]\] `(?<gate>[a-z][a-z0-9._-]+)`/gmu
for (const m of verify.matchAll(gatePattern)) {
  const t = m.groups?.gate
  if (!t) continue
  expected.add(t)
}
if (mode === 'green') {
  if (knownGreen.length === 0) console.log('no green-at-HEAD gates')
  else {
    const sorted = knownGreen.toSorted((a, b) => b.durationMs - a.durationMs)
    for (const r of sorted) console.log(`${r.gate.padEnd(36)} ${String(r.durationMs).padStart(8)}ms  ${r.ts}`)
  }
  process.exit(0)
}
if (mode === 'stale') {
  const stale = [...expected].filter(g => !knownGates.has(g))
  for (const g of stale) console.log(`${g} STALE`)
  for (const r of knownFail) console.log(`${r.gate} FAIL: ${r.notes.slice(0, 200)}`)
  if (stale.length === 0 && knownFail.length === 0) console.log('ok')
  process.exit(stale.length + knownFail.length > 0 ? 1 : 0)
}
console.error(`unknown mode: ${mode}`)
process.exit(2)
