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
import { $, file } from 'bun'
import process from 'node:process'

const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const docText = await file(`${repoRoot}/../simdocs/MIPS-DATAPATH.md`).text()
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
