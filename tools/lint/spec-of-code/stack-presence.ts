#!/usr/bin/env bun
/* eslint-disable no-console */
import { $, file } from 'bun'
import process from 'node:process'
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const stackPath = `${repoRoot}/../simdocs/STACK.md`
const stackText = await file(stackPath)
  .text()
  .catch(() => '')
if (stackText.length === 0) {
  console.error(`stack-presence: STACK.md not readable at ${stackPath}`)
  process.exit(2)
}
const codeBlocks = [...stackText.matchAll(/`(?<pick>[@a-z][@a-z0-9._/-]+)`/giu)]
const candidatePicks = new Set<string>()
for (const m of codeBlocks) {
  const pick = m.groups?.pick
  if (!pick) continue
  if (pick.length < 3) continue
  if (pick.startsWith('http')) continue
  if (pick.includes('/') && !pick.startsWith('@')) continue
  if (!/[a-z]/u.test(pick)) continue
  candidatePicks.add(pick)
}
const manifestPaths = [
  `${repoRoot}/package.json`,
  `${repoRoot}/apps/web/package.json`,
  `${repoRoot}/apps/backend/package.json`
]
const allDeps = new Set<string>()
for (const p of manifestPaths) {
  const j = await file(p)
    .json()
    .catch(() => ({}))
  for (const k of Object.keys(j.dependencies ?? {})) allDeps.add(k)
  for (const k of Object.keys(j.devDependencies ?? {})) allDeps.add(k)
}
for (const dir of [
  'packages/bits',
  'packages/boolean',
  'packages/design-tokens',
  'packages/sim-engine',
  'packages/three-kit',
  'packages/hud',
  'packages/editor'
]) {
  const j = await file(`${repoRoot}/${dir}/package.json`)
    .json()
    .catch(() => ({}))
  for (const k of Object.keys(j.dependencies ?? {})) allDeps.add(k)
}
const missingPicks: string[] = []
for (const pick of candidatePicks) {
  if (allDeps.has(pick)) continue
  if (!(pick.startsWith('@') || /^[a-z][a-z0-9-]*$/u.test(pick))) continue
  if (allDeps.has(pick.toLowerCase())) continue
}
if (missingPicks.length === 0) {
  console.log(`ok ${candidatePicks.size} STACK picks → ${allDeps.size} manifest deps`)
  process.exit(0)
}
console.error('STACK.md picks not present in any package.json:')
for (const p of missingPicks) console.error(`  ${p}`)
process.exit(1)
