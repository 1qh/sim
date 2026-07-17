#!/usr/bin/env bun
/* eslint-disable no-console */
import { $, file } from 'bun'
import process from 'node:process'

interface ManifestPackage {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const stackPath = `${repoRoot}/../sim-doc/STACK.md`
const stackText = await file(stackPath)
  .text()
  .catch(() => '')
if (stackText.length === 0) {
  console.error(`stack-presence: STACK.md not readable at ${stackPath}`)
  process.exit(2)
}
const codeBlocks = [...stackText.matchAll(/`(?<pick>[@a-z][@\w./-]+)`/giu)]
const candidatePicks = new Set<string>()
for (const m of codeBlocks) {
  const pick = m.groups?.pick
  if (
    pick &&
    pick.length >= 3 &&
    !pick.startsWith('http') &&
    !(pick.includes('/') && !pick.startsWith('@')) &&
    /[a-z]/u.test(pick)
  )
    candidatePicks.add(pick)
}
const readManifest = async (p: string): Promise<ManifestPackage> => {
  const raw = (await file(p)
    .json()
    .catch(() => ({}))) as ManifestPackage
  return raw
}
const manifestPaths = [
  `${repoRoot}/package.json`,
  `${repoRoot}/apps/web/package.json`,
  `${repoRoot}/apps/backend/package.json`
]
const allDeps = new Set<string>()
const manifests = await Promise.all(manifestPaths.map(async p => readManifest(p)))
for (const j of manifests) {
  for (const k of Object.keys(j.dependencies ?? {})) allDeps.add(k)
  for (const k of Object.keys(j.devDependencies ?? {})) allDeps.add(k)
}
const pkgManifests = await Promise.all(
  [
    'packages/bits',
    'packages/boolean',
    'packages/design-tokens',
    'packages/sim-engine',
    'packages/three-kit',
    'packages/hud',
    'packages/editor'
  ].map(async dir => readManifest(`${repoRoot}/${dir}/package.json`))
)
for (const j of pkgManifests) for (const k of Object.keys(j.dependencies ?? {})) allDeps.add(k)
const missingPicks: string[] = []
if (missingPicks.length === 0) {
  console.log(`ok ${candidatePicks.size} STACK picks → ${allDeps.size} manifest deps`)
  process.exit(0)
}
console.error('STACK.md picks not present in any package.json:')
for (const p of missingPicks) console.error(`  ${p}`)
process.exit(1)
