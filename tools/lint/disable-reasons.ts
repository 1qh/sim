#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
const out =
  await $`git grep -nIE -e 'biome-ignore[^:]*$' -- 'packages/*/src/**' 'apps/**' 'tools/**' ':!tools/lint/disable-reasons.ts'`
    .nothrow()
    .text()
if (!out.trim()) process.exit(0)
console.error('biome-ignore directives missing `: reason` suffix:')
console.error(out.trim())
process.exit(1)
