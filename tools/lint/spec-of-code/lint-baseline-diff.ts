#!/usr/bin/env bun
/* eslint-disable no-console */
import { $, file } from 'bun'
import process from 'node:process'
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const adrText = await file(`${repoRoot}/../simdocs/adr/lint-baseline.md`).text()
const rootPkg = await file(`${repoRoot}/package.json`).json()
const drift: string[] = []
if (adrText.includes('`lintmax` is the single entry point') && !rootPkg.devDependencies?.lintmax) drift.push('lintmax devDep missing despite ADR mandate')
const requireBunFix = adrText.includes('bun run fix')
if (requireBunFix && rootPkg.scripts?.fix !== 'lintmax fix') drift.push(`scripts.fix expected "lintmax fix" got "${rootPkg.scripts?.fix}"`)
const projectScripts = ['tools/lint/no-school-refs.ts', 'tools/lint/atemporal-docs.ts', 'tools/lint/substrate-boundary.ts', 'tools/lint/no-determinism-leak.ts']
for (const p of projectScripts) if (!(await file(`${repoRoot}/${p}`).exists())) drift.push(`missing ${p}`)
if (drift.length === 0) {
  console.log(`ok lint-baseline ADR matches root package.json + project lint scripts`)
  process.exit(0)
}
for (const d of drift) console.error(d)
process.exit(1)
