#!/usr/bin/env bun
/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
/** biome-ignore-all lint/nursery/useGlobalThis: noise */
/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/** biome-ignore-all lint/suspicious/noMisplacedAssertion: noise */
/** biome-ignore-all lint/nursery/noComponentHookFactories: noise */
/** biome-ignore-all lint/nursery/noContinue: noise */
/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/** biome-ignore-all lint/performance/noNamespaceImport: noise */
/** biome-ignore-all lint/complexity/noUselessStringRaw: noise */
/** biome-ignore-all lint/complexity/useMaxParams: noise */
/* eslint-disable no-console, no-await-in-loop, no-continue */
import { $, argv, file } from 'bun'
import { createHash } from 'node:crypto'
import process from 'node:process'
import { GATES } from './record-all-gates'
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
  gate: string
  status: string
  tree: string
}
const byGate = new Map<string, Row>()
for (const line of text.split('\n')) {
  if (!line.trim()) continue
  try {
    const r = JSON.parse(line) as Row
    if (r.tree === tree) byGate.set(r.gate, r)
  } catch {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: malformed rows skipped silently
  }
}
const explicit = argv.slice(2).filter(a => !a.startsWith('-'))
const dirty =
  explicit.length > 0
    ? GATES.filter(g => explicit.some(e => g.name.startsWith(e)))
    : GATES.filter(g => {
        const row = byGate.get(g.name)
        return row?.status !== 'pass'
      })
console.log(`dirty: ${dirty.length} / ${GATES.length} (tree ${tree})`)
let failed = 0
for (const g of dirty) {
  const result = await $`bun tools/ledger/record.ts ${g.name} -- bash -c ${g.cmd}`.nothrow().quiet()
  if (result.exitCode !== 0) {
    console.log(`FAIL ${g.name}`)
    failed += 1
  }
}
console.log(`done: ${dirty.length - failed} green / ${dirty.length} dirty (${GATES.length} total)`)
process.exit(failed > 0 ? 1 : 0)
