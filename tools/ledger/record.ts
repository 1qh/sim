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
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name */
/* eslint-disable no-console */
import { $, argv, file, spawn, write } from 'bun'
import { createHash } from 'node:crypto'
import process from 'node:process'
const args = argv.slice(2)
const dashIdx = args.indexOf('--')
if (dashIdx === -1) {
  console.error('usage: record <gate-name> -- <cmd...>')
  process.exit(2)
}
const gate = args.slice(0, dashIdx).join(' ').trim()
const cmd = args.slice(dashIdx + 1)
if (!gate || cmd.length === 0) {
  console.error('usage: record <gate-name> -- <cmd...>')
  process.exit(2)
}
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const ledgerPath = `${repoRoot}/ledger.jsonl`
const commit = (await $`git rev-parse HEAD`.text()).trim()
const treeRaw =
  (await $`git ls-files -s -- ":!apps/backend/convex/_generated/*" ":!tools/ledger/*"`.text()) +
  (await $`git diff -- ":!apps/backend/convex/_generated/*" ":!tools/ledger/*"`.text())
const tree = createHash('sha256').update(treeRaw).digest('hex').slice(0, 16)
const start = performance.now()
const proc = spawn(cmd, { stderr: 'pipe', stdout: 'pipe' })
const out = await new Response(proc.stdout).text()
const err = await new Response(proc.stderr).text()
const exit = await proc.exited
const durationMs = Math.round(performance.now() - start)
const status = exit === 0 ? 'pass' : 'fail'
const notes = exit === 0 ? `ok ${durationMs}ms` : (err || out).slice(-2000)
const row = { commit, durationMs, gate, notes, status, tree, ts: new Date().toISOString() }
const line = `${JSON.stringify(row)}\n`
const existing =
  (await file(ledgerPath)
    .text()
    .catch(() => '')) || ''
await write(ledgerPath, existing + line)
if (exit !== 0) {
  process.stderr.write(err)
  process.stdout.write(out)
}
process.exit(exit)
