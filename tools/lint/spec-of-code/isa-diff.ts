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
/* eslint-disable no-continue, no-console */
import { $, file } from 'bun'
import process from 'node:process'
import { FUNCT, OPCODE } from '../../../apps/web/src/features/mips/encode'

const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const isaText = await file(`${repoRoot}/../simdocs/MIPS-ISA.md`).text()
const docOpcodes = new Map<string, number>()
const docFuncts = new Map<string, number>()
for (const m of isaText.matchAll(/\|\s*`(?<mnemonic>[a-z]+)`\s*\|\s*(?<hex>0x[0-9a-f]+)\s*\|/giu)) {
  const mnemonic = m.groups?.mnemonic
  const hex = m.groups?.hex
  if (!(mnemonic && hex)) continue
  const value = Number.parseInt(hex.slice(2), 16)
  if (mnemonic in OPCODE) docOpcodes.set(mnemonic, value)
  else if (mnemonic in FUNCT) docFuncts.set(mnemonic, value)
}
const drift: string[] = []
for (const [name, value] of docOpcodes) {
  const codeValue = (OPCODE as unknown as Record<string, number>)[name]
  if (codeValue !== value) drift.push(`opcode ${name}: doc=0x${value.toString(16)} code=0x${codeValue?.toString(16)}`)
}
for (const [name, value] of docFuncts) {
  const codeValue = (FUNCT as unknown as Record<string, number>)[name]
  if (codeValue !== value) drift.push(`funct ${name}: doc=0x${value.toString(16)} code=0x${codeValue?.toString(16)}`)
}
if (drift.length === 0) {
  console.log(`ok ISA ${docOpcodes.size} opcodes + ${docFuncts.size} functs in sync`)
  process.exit(0)
}
for (const d of drift) console.error(d)
process.exit(1)
