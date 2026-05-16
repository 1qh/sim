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
/* eslint-disable no-await-in-loop, no-console */
import { $ } from 'bun'
import process from 'node:process'
import { GATES } from './record-all-gates'
let failed = 0
for (const g of GATES) {
  const result = await $`bun tools/ledger/record.ts ${g.name} -- bash -c ${g.cmd}`.nothrow().quiet()
  if (result.exitCode !== 0) {
    console.log(`FAIL ${g.name}`)
    failed += 1
  }
}
console.log(`done: ${GATES.length - failed} green / ${GATES.length} total`)
process.exit(failed > 0 ? 1 : 0)
