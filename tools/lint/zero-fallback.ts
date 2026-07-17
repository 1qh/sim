#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
/** `[A-Z_]` cannot match a digit, so every env name carrying one — S3_KEY, OAUTH2_SECRET — was invisible to this and its fallback shipped unseen. Proven: a planted `process.env.S3_KEY ?? '…'` passed while `process.env.FOO ?? '…'` on the line above was caught. */
const ENV_NAME = '[A-Z0-9_]+'
const PATTERNS = [
  String.raw`process\.env\.${ENV_NAME} \?\? ['"]`,
  String.raw`Bun\.env\.${ENV_NAME} \?\? ['"]`,
  String.raw`process\.env\.${ENV_NAME} \|\| ['"]`,
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
