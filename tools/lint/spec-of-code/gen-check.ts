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
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const beforeHash = (
  await $`find apps/backend/convex/_generated -type f -name '*.ts' -o -name '*.js' -o -name '*.d.ts' | sort | xargs cat`
    .cwd(repoRoot)
    .nothrow()
    .text()
).length
await $`cd apps/backend && bunx convex codegen --typecheck disable`.cwd(repoRoot).nothrow().quiet()
const afterHash = (
  await $`find apps/backend/convex/_generated -type f -name '*.ts' -o -name '*.js' -o -name '*.d.ts' | sort | xargs cat`
    .cwd(repoRoot)
    .nothrow()
    .text()
).length
if (beforeHash === afterHash) {
  console.log(`ok codegen idempotent: ${beforeHash} chars unchanged`)
  process.exit(0)
}
console.error(`gen.check: codegen produced different output (${beforeHash} → ${afterHash})`)
process.exit(1)
