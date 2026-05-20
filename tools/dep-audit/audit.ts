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
import { argv, file } from 'bun'
import process from 'node:process'

const NOW = Date.now()
const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000
const THRESHOLD = NOW - SIX_MONTHS_MS
const REAL_NPM_CATS = [
  'core3d',
  'editor',
  'framework',
  'state',
  'validation',
  'animation',
  'ui',
  'utility',
  'persistence',
  'substrate_pure',
  'search',
  'color',
  'syntax_highlight',
  'tooling',
  'lint',
  'perf',
  'test'
]
const REMAP: Record<string, string> = { 'mini-search': 'minisearch' }
const args = argv.slice(2)
const namesArgIdx = args.indexOf('--names')
const names = new Set<string>()
if (namesArgIdx === -1) {
  const defaultPath = new URL('../../../simdocs/deps.json', import.meta.url).pathname
  const depsPath = args[0] ?? defaultPath
  const deps = (await file(depsPath).json()) as Record<string, string[]>
  for (const cat of REAL_NPM_CATS) for (const n of deps[cat] ?? []) names.add(REMAP[n] ?? n)
} else
  for (const n of (args[namesArgIdx + 1] ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean))
    names.add(n)
interface R {
  days: number
  name: string
  pubMs: number
  v: string
}
const stale: R[] = []
const notFound: string[] = []
const greenR: R[] = []
await Promise.all(
  [...names].map(async name => {
    try {
      const r = await fetch(`https://registry.npmjs.org/${name.replaceAll('/', '%2F')}`)
      if (!r.ok) {
        notFound.push(name)
        return
      }
      const j = (await r.json()) as { time?: Record<string, string> }
      const time = j.time ?? {}
      let v = ''
      let pubMs = Number.NEGATIVE_INFINITY
      for (const [ver, ts] of Object.entries(time)) {
        if (ver === 'created' || ver === 'modified') continue
        const t = Date.parse(ts)
        if (Number.isFinite(t) && t > pubMs) {
          pubMs = t
          v = ver
        }
      }
      if (pubMs === Number.NEGATIVE_INFINITY) {
        notFound.push(name)
        return
      }
      const days = Math.floor((NOW - pubMs) / 86_400_000)
      const entry: R = { days, name, pubMs, v }
      if (pubMs < THRESHOLD) stale.push(entry)
      else greenR.push(entry)
    } catch {
      notFound.push(name)
    }
  })
)
const total = names.size
const adhoc = namesArgIdx !== -1
const fmt = (r: R) =>
  `${r.name.padEnd(36)} v${r.v.padEnd(20)} ${new Date(r.pubMs).toISOString().slice(0, 10)} (${r.days}d)`
if (adhoc) {
  const all = [...greenR, ...stale].toSorted((a, b) => b.pubMs - a.pubMs)
  for (const r of all) console.log(`${fmt(r)} ${r.pubMs < THRESHOLD ? 'STALE' : 'GREEN'}`)
  for (const n of notFound) console.log(`${n.padEnd(36)} NOT FOUND`)
  process.exit(stale.length + notFound.length > 0 ? 1 : 0)
}
if (stale.length === 0 && notFound.length === 0) {
  console.log(`ok ${greenR.length}/${total} deps green`)
  process.exit(0)
}
console.log(`${greenR.length}/${total} green, ${stale.length} stale, ${notFound.length} missing`)
if (stale.length > 0) {
  stale.sort((a, b) => a.pubMs - b.pubMs)
  console.log('\nSTALE:')
  for (const r of stale) console.log(`  ${fmt(r)}`)
}
if (notFound.length > 0) {
  console.log('\nNOT FOUND:')
  for (const n of notFound) console.log(`  ${n}`)
}
process.exit(1)
