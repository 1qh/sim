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
