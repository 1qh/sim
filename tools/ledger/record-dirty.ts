#!/usr/bin/env bun
/** biome-ignore-all lint/style/noProcessEnv: passes tree/commit to child gate procs */
/** biome-ignore-all lint/nursery/noContinue: noise */
/* eslint-disable no-console, no-continue */
import { argv, file } from 'bun'
import process from 'node:process'
import { ledgerEnv, runPool } from './pool'
import { GATES } from './record-all-gates'

const env = await ledgerEnv()
process.env = { ...process.env, ...env }
const tree = env.LEDGER_TREE
const text = await file(`${env.LEDGER_REPO_ROOT}/ledger.jsonl`)
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
  const r = JSON.parse(line) as Row
  if (r.tree === tree) byGate.set(r.gate, r)
}
const explicit = argv.slice(2).filter(a => !a.startsWith('-'))
const dirty =
  explicit.length > 0
    ? GATES.filter(g => explicit.some(e => g.name.startsWith(e)))
    : GATES.filter(g => byGate.get(g.name)?.status !== 'pass')
console.log(`dirty: ${dirty.length} / ${GATES.length} (tree ${tree})`)
const failed = await runPool(dirty)
console.log(`done: ${dirty.length - failed} green / ${dirty.length} dirty (${GATES.length} total)`)
process.exit(failed > 0 ? 1 : 0)
