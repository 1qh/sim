#!/usr/bin/env bun
/** biome-ignore-all lint/style/noProcessEnv: reads harness-passed LEDGER_TREE for cache key */
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
/* oxlint-disable promise/param-names */
/* eslint-disable no-promise-executor-return, @typescript-eslint/strict-void-return, no-await-in-loop */
import { $, file, write } from 'bun'
import { existsSync, mkdirSync } from 'node:fs'
import process from 'node:process'

const envTree = process.env.LEDGER_TREE
const key = envTree ?? 'manual'
const resultFile = `/tmp/size-limit-${key}.json`
const lockDir = `/tmp/size-limit-${key}.lock`
if (existsSync(resultFile)) {
  const r = (await file(resultFile).json()) as { code: number }
  process.exit(r.code)
}
try {
  mkdirSync(lockDir)
} catch {
  while (!existsSync(resultFile)) await new Promise(res => setTimeout(res, 1000))
  const r = (await file(resultFile).json()) as { code: number }
  process.exit(r.code)
}
const proc = await $`bunx size-limit`.nothrow()
await write(resultFile, JSON.stringify({ code: proc.exitCode }))
await $`rmdir ${lockDir}`.nothrow().quiet()
process.exit(proc.exitCode)
