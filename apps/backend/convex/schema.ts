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
import { authTables } from '@convex-dev/auth/server'
import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  ...authTables,
  rateLimitWindows: defineTable({
    count: v.number(),
    keyHash: v.string(),
    windowStartMs: v.number()
  }).index('byKeyHash', ['keyHash']),
  snapshots: defineTable({
    bytes: v.number(),
    canonicalJson: v.string(),
    claimedByUserId: v.optional(v.id('users')),
    createdAt: v.number(),
    hash: v.string(),
    kind: v.union(v.literal('mips'), v.literal('kmap'), v.literal('compare'), v.literal('pipeline')),
    parentHash: v.optional(v.string()),
    submitterFingerprint: v.string()
  })
    .index('byHash', ['hash'])
    .index('byUser', ['claimedByUserId'])
    .index('byFingerprint', ['submitterFingerprint']),
  userProfiles: defineTable({
    createdAt: v.number(),
    isAdmin: v.boolean(),
    lastSeenAt: v.number(),
    userId: v.id('users')
  }).index('byUserId', ['userId'])
})
