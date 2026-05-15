#!/usr/bin/env bun
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
const BANNED = [
  String.raw`google-analytics`,
  String.raw`googletagmanager`,
  String.raw`segment\.io`,
  String.raw`mixpanel`,
  String.raw`amplitude`,
  String.raw`fullstory`,
  String.raw`hotjar`,
  String.raw`posthog`,
  String.raw`@sentry/`,
  String.raw`bugsnag`,
  String.raw`gtag\(`,
  String.raw`fbq\(`
]
const results = await Promise.all(
  BANNED.map(async term => {
    const out =
      await $`git grep -nIE -e ${term} -- 'packages/*/src/**' 'apps/**' ':!tools/lint/no-third-party-trackers.ts'`
        .nothrow()
        .text()
    return out.trim() ? `# ${term}\n${out.trim()}` : ''
  })
)
const hits = results.filter(Boolean)
if (hits.length === 0) process.exit(0)
console.error(hits.join('\n\n'))
process.exit(1)
