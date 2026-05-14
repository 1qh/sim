#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
const BANNED = [
  String.raw`Math\.random`,
  String.raw`\bDate\.now\b`,
  String.raw`Intl\.Collator`,
  String.raw`\bnew Set\(`,
  String.raw`\bnew Map\(`,
  String.raw`\bBigInt\(`,
  String.raw`\bNaN\b`,
  String.raw`\bInfinity\b`,
  String.raw`performance\.now`,
  String.raw`crypto\.randomUUID`,
  String.raw`Bun\.randomUUIDv7`
]
const results = await Promise.all(
  BANNED.map(async term => {
    const out =
      await $`git grep -nIE -e ${term} -- 'packages/sim-engine/src/**' 'packages/bits/src/**' 'packages/boolean/src/**' ':!tools/lint/no-determinism-leak.ts'`
        .nothrow()
        .text()
    return out.trim() ? `# ${term}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
