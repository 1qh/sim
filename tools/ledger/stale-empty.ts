#!/usr/bin/env bun
/* eslint-disable no-console */
import { file } from 'bun'
import process from 'node:process'
import { ledgerEnv } from './pool'
import { GATES } from './record-all-gates'

interface Row {
  gate: string
  status: string
  tree: string
}
const env = await ledgerEnv()
const tree = env.LEDGER_TREE
const text = await file(`${env.LEDGER_REPO_ROOT}/ledger.jsonl`)
  .text()
  .catch(() => '')
const byGate = new Map<string, Row>()
for (const line of text.split('\n'))
  if (line.trim()) {
    const r = JSON.parse(line) as Row
    if (r.tree === tree) byGate.set(r.gate, r)
  }
const SELF = 'infra.ledger.stale-empty'
const stale = GATES.filter(g => g.name !== SELF).filter(g => byGate.get(g.name)?.status !== 'pass')
if (stale.length > 0) {
  console.error(
    `ledger.stale: ${stale.length} gate(s) without a pass at tree ${tree}: ${stale.map(g => g.name).join(',')}`
  )
  process.exit(1)
}
console.log(`ok ledger.stale empty: ${GATES.length - 1} gates pass at tree ${tree}`)
process.exit(0)
