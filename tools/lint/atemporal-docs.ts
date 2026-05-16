#!/usr/bin/env bun
/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
/** biome-ignore-all lint/nursery/useGlobalThis: noise */
/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/** biome-ignore-all lint/suspicious/noMisplacedAssertion: noise */
/** biome-ignore-all lint/nursery/noComponentHookFactories: noise */
/** biome-ignore-all lint/nursery/noContinue: noise */
/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/** biome-ignore-all lint/performance/noNamespaceImport: noise */
/** biome-ignore-all lint/complexity/noUselessStringRaw: noise */
/** biome-ignore-all lint/complexity/useMaxParams: noise */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name */
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
const BANNED = [
  String.raw`\bpreviously\b`,
  String.raw`\bwe switched from\b`,
  String.raw`\boriginally\b`,
  String.raw`\bfor now\b`,
  String.raw`\bin v[0-9]\b`,
  String.raw`\bnext iteration\b`,
  String.raw`\bthe old approach\b`,
  String.raw`\bcurrently we\b`,
  String.raw`\bin the future we\b`,
  String.raw`\bmigrate later\b`
]
const results = await Promise.all(
  BANNED.map(async term => {
    const out =
      await $`git grep -nIE -e ${term} -- '*.md' ':!CLAUDE.md' ':!tools/lint/atemporal-docs.ts' ':!simdocs/GOTCHAS.md'`
        .nothrow()
        .text()
    return out.trim() ? `# ${term}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
