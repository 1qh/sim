/** biome-ignore-all lint/style/noProcessEnv: live local Convex env */
import { describe, expect, test } from 'bun:test'
import { ConvexHttpClient } from 'convex/browser'
import { api } from './_generated/api'
const URL_ENV = process.env.CONVEX_SELF_HOSTED_URL
const SKIP = URL_ENV === undefined
const url = URL_ENV ?? 'http://127.0.0.1:3220'
const client = new ConvexHttpClient(url)
const uniqueHash = (): string => `live-${Math.floor(Date.now())}-${Math.random().toString(36).slice(2, 8)}`
describe.if(!SKIP)('snapshots live against local self-host', () => {
  test('saveSnapshot creates row + loadSnapshot returns it', async () => {
    const hash = uniqueHash()
    const fp = uniqueHash()
    const res = await client.mutation(api.snapshots.saveSnapshot, {
      bytes: 32,
      canonicalJson: '{"x":1}',
      fingerprint: fp,
      hash,
      kind: 'mips',
      parentHash: undefined
    })
    expect(res.created).toBe(true)
    const row = await client.query(api.snapshots.loadSnapshot, { hash })
    expect(row?.hash).toBe(hash)
  }, 30_000)
  test('duplicate hash idempotent', async () => {
    const hash = uniqueHash()
    const fp = uniqueHash()
    const args = { bytes: 1, canonicalJson: '{"y":1}', fingerprint: fp, hash, kind: 'kmap' as const, parentHash: undefined }
    const a = await client.mutation(api.snapshots.saveSnapshot, args)
    const b = await client.mutation(api.snapshots.saveSnapshot, args)
    expect(a.created).toBe(true)
    expect(b.created).toBe(false)
  }, 30_000)
  test('rate-limit: 31st request in window throws', async () => {
    const fp = uniqueHash()
    for (let i = 0; i < 30; i++) {
      await client.mutation(api.snapshots.saveSnapshot, {
        bytes: 1,
        canonicalJson: `{"i":${i}}`,
        fingerprint: fp,
        hash: uniqueHash(),
        kind: 'mips',
        parentHash: undefined
      })
    }
    await expect(
      client.mutation(api.snapshots.saveSnapshot, {
        bytes: 1,
        canonicalJson: '{"i":31}',
        fingerprint: fp,
        hash: uniqueHash(),
        kind: 'mips',
        parentHash: undefined
      })
    ).rejects.toThrow(/rate_limit_exceeded/u)
  }, 60_000)
})
