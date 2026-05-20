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
