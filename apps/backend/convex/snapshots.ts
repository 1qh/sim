import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX = 30
const fingerprintHash = async (fp: string): Promise<string> => {
  const bytes = new TextEncoder().encode(fp)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('')
}
export const saveSnapshot = mutation({
  args: {
    bytes: v.number(),
    canonicalJson: v.string(),
    fingerprint: v.string(),
    hash: v.string(),
    kind: v.union(v.literal('mips'), v.literal('kmap'), v.literal('compare'), v.literal('pipeline')),
    parentHash: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const keyHash = await fingerprintHash(args.fingerprint)
    const now = Date.now()
    const existingWindow = ctx.db
      .query('rateLimitWindows')
      .withIndex('byKeyHash', q => q.eq('keyHash', keyHash))
      .first()
    if (existingWindow !== null && now - existingWindow.windowStartMs < RATE_LIMIT_WINDOW_MS) {
      if (existingWindow.count >= RATE_LIMIT_MAX) throw new Error('rate_limit_exceeded')
      await ctx.db.patch(existingWindow._id, { count: existingWindow.count + 1 })
    } else if (existingWindow === null) await ctx.db.insert('rateLimitWindows', { count: 1, keyHash, windowStartMs: now })
    else await ctx.db.patch(existingWindow._id, { count: 1, windowStartMs: now })
    const existing = ctx.db
      .query('snapshots')
      .withIndex('byHash', q => q.eq('hash', args.hash))
      .first()
    if (existing !== null) return { created: false, hash: args.hash }
    await ctx.db.insert('snapshots', {
      bytes: args.bytes,
      canonicalJson: args.canonicalJson,
      claimedByUserId: undefined,
      createdAt: now,
      hash: args.hash,
      kind: args.kind,
      parentHash: args.parentHash,
      submitterFingerprint: args.fingerprint
    })
    return { created: true, hash: args.hash }
  }
})
export const loadSnapshot = query({
  args: { hash: v.string() },
  handler: async (ctx, { hash }) =>
    ctx.db
      .query('snapshots')
      .withIndex('byHash', q => q.eq('hash', hash))
      .first()
})
export const claimAnonSnapshots = mutation({
  args: { fingerprint: v.string(), userId: v.id('users') },
  handler: async (ctx, { fingerprint, userId }) => {
    const owned = await ctx.db
      .query('snapshots')
      .withIndex('byFingerprint', q => q.eq('submitterFingerprint', fingerprint))
      .collect()
    let claimed = 0
    for (const row of owned) {
      if (row.claimedByUserId !== undefined) continue
      await ctx.db.patch(row._id, { claimedByUserId: userId })
      claimed += 1
    }
    return { claimed }
  }
})
