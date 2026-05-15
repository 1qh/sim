#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
const out =
  await $`git grep -nIE -e 'dangerouslySetInnerHTML' -- 'packages/*/src/**' 'apps/**' ':!tools/lint/no-dangerously-set-inner-html.ts'`
    .nothrow()
    .text()
if (!out.trim()) process.exit(0)
console.error(out.trim())
process.exit(1)
