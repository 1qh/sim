#!/usr/bin/env bun
/* eslint-disable no-console */
import { $, file } from 'bun'
import process from 'node:process'
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const readGen = async (): Promise<number> =>
  (await $`find apps/backend/convex/_generated -type f -name '*.ts' -o -name '*.js' -o -name '*.d.ts' | sort | xargs cat`.cwd(repoRoot).nothrow().text()).length
await $`cd apps/backend && bunx convex codegen --typecheck disable`.cwd(repoRoot).nothrow().quiet()
const beforeHash = await readGen()
await $`cd apps/backend && bunx convex codegen --typecheck disable`.cwd(repoRoot).nothrow().quiet()
const afterHash = await readGen()
if (beforeHash === afterHash) {
  console.log(`ok codegen idempotent: ${beforeHash} chars unchanged across two runs`)
  process.exit(0)
}
console.error(`gen.check: codegen produced different output (${beforeHash} → ${afterHash})`)
process.exit(1)
