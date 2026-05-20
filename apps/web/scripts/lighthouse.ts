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
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name */
/* eslint-disable no-promise-executor-return, @typescript-eslint/strict-void-return, no-await-in-loop, no-console */
import { $, argv, file, spawn, write } from 'bun'
import { existsSync, mkdirSync } from 'node:fs'
import process from 'node:process'

const ROUTES = ['/', '/mips', '/kmap', '/compare', '/pipeline', '/learn', '/learn/foundation', '/s/abc123']
const PERF_MIN = 0.88
const A11Y_MIN = 0.97
const routeArg = argv[2]
const envTree = process.env.LEDGER_TREE
const cacheKey = envTree ?? 'manual'
const cacheDir = `/tmp/lh-cache-${cacheKey}`
const lockDir = `${cacheDir}.lock`
const slug = (p: string): string => p.replaceAll('/', '_') || '_root'
interface Score {
  a11y: number
  perf: number
}
const readCache = async (path: string): Promise<Score | undefined> => {
  const f = `${cacheDir}/${slug(path)}.json`
  if (!existsSync(f)) return
  return (await file(f).json()) as Score
}
const audit = async (): Promise<void> => {
  mkdirSync(cacheDir, { recursive: true })
  const server = spawn(['bun', 'run', 'start', '--', '-p', '3000'], { stderr: 'pipe', stdout: 'pipe' })
  await new Promise(r => setTimeout(r, 3000))
  for (const path of ROUTES) {
    const tmp = `/tmp/lh-${slug(path)}.json`
    await $`bunx lighthouse http://127.0.0.1:3000${path} --quiet --chrome-flags=--headless --output=json --output-path=${tmp}`
      .nothrow()
      .quiet()
    const j = (await file(tmp).json()) as {
      categories: { accessibility: { score: number }; performance: { score: number } }
    }
    await write(
      `${cacheDir}/${slug(path)}.json`,
      JSON.stringify({ a11y: j.categories.accessibility.score, perf: j.categories.performance.score })
    )
  }
  server.kill()
}
const ensureCache = async (): Promise<void> => {
  try {
    mkdirSync(lockDir)
  } catch {
    while (existsSync(lockDir) && !existsSync(`${cacheDir}/_root.json`)) await new Promise(r => setTimeout(r, 1000))
    return
  }
  try {
    await audit()
  } finally {
    await $`rmdir ${lockDir}`.nothrow().quiet()
  }
}
const assertRoute = (path: string, s: Score): boolean => {
  const passed = s.perf >= PERF_MIN && s.a11y >= A11Y_MIN
  console.log(`${path.padEnd(28)} perf=${s.perf.toFixed(2)} a11y=${s.a11y.toFixed(2)} ${passed ? 'ok' : 'FAIL'}`)
  return passed
}
let existing = routeArg === undefined ? undefined : await readCache(routeArg)
if (existing === undefined) {
  await ensureCache()
  existing = routeArg === undefined ? undefined : await readCache(routeArg)
}
if (routeArg !== undefined) {
  const s = existing ?? (await readCache(routeArg))
  if (s === undefined) {
    console.log(`${routeArg} no cache`)
    process.exit(1)
  }
  process.exit(assertRoute(routeArg, s) ? 0 : 1)
}
let allGreen = true
for (const path of ROUTES) {
  const s = await readCache(path)
  if (s === undefined || !assertRoute(path, s)) allGreen = false
}
process.exit(allGreen ? 0 : 1)
