#!/usr/bin/env bun
/** biome-ignore-all lint/style/noProcessEnv: ledger harness reads env-passed tree/commit */
/* eslint-disable no-console */
import { $, argv, spawn } from 'bun'
import { createHash } from 'node:crypto'
import { appendFile } from 'node:fs/promises'
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
const repoRoot = process.env.LEDGER_REPO_ROOT ?? (await $`git rev-parse --show-toplevel`.text()).trim()
const ledgerPath = `${repoRoot}/ledger.jsonl`
const commit = process.env.LEDGER_COMMIT ?? (await $`git rev-parse HEAD`.text()).trim()
const tree =
  process.env.LEDGER_TREE ??
  createHash('sha256')
    .update(
      (await $`git ls-files -s -- ":!apps/backend/convex/_generated/*" ":!tools/ledger/*"`.text()) +
        (await $`git diff -- ":!apps/backend/convex/_generated/*" ":!tools/ledger/*"`.text())
    )
    .digest('hex')
    .slice(0, 16)
const start = performance.now()
const proc = spawn(cmd, { stderr: 'pipe', stdout: 'pipe' })
const out = await new Response(proc.stdout).text()
const err = await new Response(proc.stderr).text()
const exit = await proc.exited
const durationMs = Math.round(performance.now() - start)
const status = exit === 0 ? 'pass' : 'fail'
const notes = exit === 0 ? `ok ${durationMs}ms` : (err || out).slice(-2000)
const row = { commit, durationMs, gate, notes, status, tree, ts: new Date().toISOString() }
await appendFile(ledgerPath, `${JSON.stringify(row)}\n`)
if (exit !== 0) {
  process.stderr.write(err)
  process.stdout.write(out)
}
process.exit(exit)
