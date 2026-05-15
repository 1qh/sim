#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
const BANNED = [
  String.raw`@cloudflare/workers-types`,
  String.raw`from ['"]cloudflare:`,
  String.raw`KVNamespace`,
  String.raw`D1Database`,
  String.raw`R2Bucket`,
  String.raw`DurableObject\b`,
  String.raw`Pages Functions`,
  String.raw`export const onRequest`
]
const results = await Promise.all(
  BANNED.map(async term => {
    const out = await $`git grep -nIE -e ${term} -- 'packages/*/src/**' 'apps/**' ':!tools/lint/cloudflare-bearer.ts'`
      .nothrow()
      .text()
    return out.trim() ? `# ${term}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
