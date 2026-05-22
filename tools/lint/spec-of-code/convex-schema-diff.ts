#!/usr/bin/env bun
/* eslint-disable no-console */
import { $, file } from 'bun'
import process from 'node:process'

const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const schemaText = await file(`${repoRoot}/apps/backend/convex/schema.ts`).text()
const docText = await file(`${repoRoot}/../simdocs/SCHEMAS.md`).text()
const codeTables = new Set<string>()
for (const m of schemaText.matchAll(/^\s+(?<table>[a-zA-Z_][a-zA-Z0-9_]*):\s*defineTable/gmu))
  if (m.groups?.table) codeTables.add(m.groups.table)
const AUTH_TABLES = [
  'users',
  'authSessions',
  'authAccounts',
  'authVerifiers',
  'authVerificationCodes',
  'authRefreshTokens',
  'authRateLimits'
]
if (schemaText.includes('authTables')) for (const t of AUTH_TABLES) codeTables.add(t)
const docTables = new Set<string>()
for (const m of docText.matchAll(/^### `(?<table>[a-zA-Z_][a-zA-Z0-9_]*)`/gmu))
  if (m.groups?.table) docTables.add(m.groups.table)
const AUTH_TABLE_SET = new Set([
  'authAccounts',
  'authRateLimits',
  'authRefreshTokens',
  'authSessions',
  'authVerificationCodes',
  'authVerifiers'
])
const missingInDoc = [...codeTables].filter(t => !(docTables.has(t) || AUTH_TABLE_SET.has(t)))
const missingInCode = [...docTables].filter(t => !codeTables.has(t))
if (missingInDoc.length === 0 && missingInCode.length === 0) {
  console.log(`ok ${codeTables.size} convex tables in sync`)
  process.exit(0)
}
if (missingInDoc.length > 0) console.error(`tables in schema.ts missing from SCHEMAS.md: ${missingInDoc.join(', ')}`)
if (missingInCode.length > 0) console.error(`tables in SCHEMAS.md missing from schema.ts: ${missingInCode.join(', ')}`)
process.exit(1)
