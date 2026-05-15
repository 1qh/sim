#!/usr/bin/env bun
/* eslint-disable no-console */
import { $, file, spawn } from 'bun'
import process from 'node:process'
const ROUTES = ['/', '/mips', '/kmap', '/compare', '/pipeline', '/learn', '/learn/foundation', '/s/abc123']
const PERF_MIN = 0.7
const A11Y_MIN = 0.9
const server = spawn(['bun', 'run', 'start', '--', '-p', '3000'], { stderr: 'pipe', stdout: 'pipe' })
await new Promise(r => setTimeout(r, 3000))
let allGreen = true
for (const path of ROUTES) {
  const tmp = `/tmp/lh-${path.replaceAll('/', '_')}.json`
  await $`bunx lighthouse http://127.0.0.1:3000${path} --quiet --chrome-flags=--headless --output=json --output-path=${tmp}`.nothrow().quiet()
  const j = (await file(tmp).json()) as { categories: { accessibility: { score: number }; performance: { score: number } } }
  const perf = j.categories.performance.score
  const a11y = j.categories.accessibility.score
  const passed = perf >= PERF_MIN && a11y >= A11Y_MIN
  console.log(`${path.padEnd(28)} perf=${perf.toFixed(2)} a11y=${a11y.toFixed(2)} ${passed ? 'ok' : 'FAIL'}`)
  if (!passed) allGreen = false
}
server.kill()
process.exit(allGreen ? 0 : 1)
