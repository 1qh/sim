#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'

const PATTERNS = [
  String.raw`process\.env\.[A-Z_]+ \?\? ['"]`,
  String.raw`Bun\.env\.[A-Z_]+ \?\? ['"]`,
  String.raw`process\.env\.[A-Z_]+ \|\| ['"]`,
  String.raw`getenv\([^)]+\) \|\| ['"]`
]
const results = await Promise.all(
  PATTERNS.map(async p => {
    const out = await $`git grep -nIE -e ${p} -- 'packages/*/src/**' 'apps/**' 'tools/**' ':!tools/lint/zero-fallback.ts'`
      .nothrow()
      .text()
    return out.trim() ? `# ${p}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
