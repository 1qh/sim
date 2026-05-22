#!/usr/bin/env bun
/* eslint-disable no-console */
import { $, file } from 'bun'
import process from 'node:process'

interface RootPackage {
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
}
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const adrText = await file(`${repoRoot}/../simdocs/adr/lint-baseline.md`).text()
const rootPkg = (await file(`${repoRoot}/package.json`).json()) as RootPackage
const drift: string[] = []
if (adrText.includes('`lintmax` is the single entry point') && !rootPkg.devDependencies?.lintmax)
  drift.push('lintmax devDep missing despite ADR mandate')
const requireBunFix = adrText.includes('bun run fix')
if (requireBunFix && rootPkg.scripts?.fix !== 'lintmax fix')
  drift.push(`scripts.fix expected "lintmax fix" got "${rootPkg.scripts?.fix ?? ''}"`)
const projectScripts = [
  'tools/lint/no-school-refs.ts',
  'tools/lint/atemporal-docs.ts',
  'tools/lint/substrate-boundary.ts',
  'tools/lint/no-determinism-leak.ts'
]
const presence = await Promise.all(
  projectScripts.map(async p => ({ exists: await file(`${repoRoot}/${p}`).exists(), path: p }))
)
for (const { exists, path } of presence) if (!exists) drift.push(`missing ${path}`)
if (drift.length === 0) {
  console.log('ok lint-baseline ADR matches root package.json + project lint scripts')
  process.exit(0)
}
for (const d of drift) console.error(d)
process.exit(1)
