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
const PATTERNS = [
  String.raw`\buntil\b.*\bdo\b(?![\s\S]{0,400}\bdate\b)`,
  String.raw`\bwhile true\b(?![\s\S]{0,400}AbortSignal\.timeout)`,
  String.raw`\bwhile\s*\(\s*true\s*\)(?![\s\S]{0,400}AbortSignal\.timeout)`
]
const results = await Promise.all(
  PATTERNS.map(async p => {
    const out =
      await $`git grep -nIE -e ${p} -- 'tools/**' 'packages/*/src/**' 'apps/**' '*.sh' ':!tools/lint/check-no-infinite-wait.ts'`
        .nothrow()
        .text()
    return out.trim() ? `# ${p}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
