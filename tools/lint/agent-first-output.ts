#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'

const BANNED_PATTERNS = [
  'echo "✓',
  'echo "✔',
  String.raw`console\.log\("✓`,
  String.raw`\bchalk\b`,
  String.raw`\bkleur\b`,
  String.raw`\bora\b`,
  String.raw`process\.stdout\.write\("\\u`,
  'banner',
  'spinner'
]
const results = await Promise.all(
  BANNED_PATTERNS.map(async term => {
    const out =
      await $`git grep -nIE -e ${term} -- 'tools/**' 'scripts/**' '*.sh' 'Makefile' ':!tools/lint/agent-first-output.ts'`
        .nothrow()
        .text()
    return out.trim() ? `# ${term}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
