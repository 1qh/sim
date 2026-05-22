#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'

const BANNED = [
  String.raw`\bMIPS\b`,
  String.raw`\bopcode\b`,
  String.raw`\binstruction\b`,
  String.raw`\bdatapath\b`,
  String.raw`\bkarnaugh\b`,
  String.raw`\bkmap\b`,
  String.raw`\bk-map\b`,
  String.raw`\bminterm\b`,
  String.raw`\bmaxterm\b`,
  String.raw`\bregister file\b`,
  String.raw`\bALU\b`,
  String.raw`\baddi\b`,
  String.raw`\bbeq\b`
]
const results = await Promise.all(
  BANNED.map(async term => {
    const out = await $`git grep -nIE -i -e ${term} -- 'packages/*/src/**' ':!tools/lint/substrate-boundary.ts'`
      .nothrow()
      .text()
    return out.trim() ? `# ${term}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
