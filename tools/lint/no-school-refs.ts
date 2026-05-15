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
/* eslint-disable no-namespace, no-console */
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
