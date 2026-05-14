#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
const BANNED = [
  'CS2100',
  'Orbital',
  String.raw`\bNUS\b`,
  'Apollo 11',
  String.raw`\bcourse\b`,
  String.raw`\bexam\b`,
  String.raw`\blecture\b`,
  String.raw`\bstudent\b`,
  String.raw`\bhomework\b`,
  String.raw`\bassignment\b`,
  String.raw`\bsyllabus\b`
]
const results = await Promise.all(
  BANNED.map(async term => {
    const out =
      await $`git grep -nIE -e ${term} -- 'packages/*/src/**' 'apps/web/src/**' 'apps/web/app/**' 'apps/backend/convex/**' 'tools/**' ':!tools/lint/no-school-refs.ts'`
        .nothrow()
        .text()
    return out.trim() ? `# ${term}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
