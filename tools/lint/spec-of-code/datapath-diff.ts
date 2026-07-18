#!/usr/bin/env bun
/* eslint-disable no-console */
import { $, file } from 'bun'
import process from 'node:process'

const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const docText = await file(`${repoRoot}/../sim-doc/MIPS-DATAPATH.md`)
  .text()
  .catch(() => '')
if (docText.length === 0) {
  console.log('ok datapath-diff skipped: sim-doc not present as sibling')
  process.exit(0)
}
const SIGNAL_NAMES = [
  'RegDst',
  'ALUSrc',
  'MemToReg',
  'RegWrite',
  'MemRead',
  'MemWrite',
  'Branch',
  'BranchNE',
  'ALUOp',
  'PCSrc'
]
const missingInDoc: string[] = []
for (const name of SIGNAL_NAMES) if (!docText.includes(`\`${name}\``)) missingInDoc.push(name)
if (missingInDoc.length === 0) {
  console.log(`ok ${SIGNAL_NAMES.length} control signals documented`)
  process.exit(0)
}
console.error(`control signals missing from MIPS-DATAPATH.md: ${missingInDoc.join(', ')}`)
process.exit(1)
