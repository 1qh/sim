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
/* eslint-disable no-promise-executor-return, @typescript-eslint/strict-void-return, no-await-in-loop, no-console */
import { $, argv, file, write } from 'bun'
import { existsSync, mkdirSync } from 'node:fs'
import process from 'node:process'
const spec = argv[2]
const titleMatch = argv[3]
if (spec === undefined || titleMatch === undefined) {
  console.log('usage: pw-cached <spec> <titleMatch>')
  process.exit(2)
}
const envTree = process.env.LEDGER_TREE
const key = envTree ?? 'manual'
const cacheFile = `/tmp/pw-${key}-${spec}.json`
const lockDir = `/tmp/pw-${key}-${spec}.lock`
interface PwReport {
  suites: { specs: { tests: { results: { status: string }[] }[]; title: string }[]; suites?: PwReport['suites'] }[]
}
interface Spec {
  ok: boolean
  title: string
}
const flatten = (suites: PwReport['suites'], out: Spec[]): void => {
  for (const s of suites) {
    for (const sp of s.specs)
      out.push({ ok: sp.tests.every(t => t.results.every(r => r.status === 'passed')), title: sp.title })
    if (s.suites !== undefined) flatten(s.suites, out)
  }
}
const buildCache = async (): Promise<void> => {
  const json = `/tmp/pw-raw-${key}-${spec}.json`
  await $`bunx playwright test tests/${spec} --reporter=json`
    .env({ ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: json })
    .nothrow()
    .quiet()
  const report = (await file(json).json()) as PwReport
  const specs: Spec[] = []
  flatten(report.suites, specs)
  await write(cacheFile, JSON.stringify(specs))
}
const ensureCache = async (): Promise<void> => {
  if (existsSync(cacheFile)) return
  try {
    mkdirSync(lockDir)
  } catch {
    while (!existsSync(cacheFile)) await new Promise(r => setTimeout(r, 1000))
    return
  }
  try {
    await buildCache()
  } finally {
    await $`rmdir ${lockDir}`.nothrow().quiet()
  }
}
await ensureCache()
const specs = (await file(cacheFile).json()) as Spec[]
const matched = specs.filter(s => s.title.includes(titleMatch))
if (matched.length === 0) {
  console.log(`no test matching "${titleMatch}" in ${spec}`)
  process.exit(1)
}
const allOk = matched.every(s => s.ok)
console.log(`${titleMatch} ${allOk ? 'ok' : 'FAIL'} (${matched.length} test(s))`)
process.exit(allOk ? 0 : 1)
