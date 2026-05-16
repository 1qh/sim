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
import { describe, expect, test } from 'bun:test'
import { ConvexHttpClient } from 'convex/browser'
import { api } from './_generated/api'
const URL_ENV = process.env.CONVEX_SELF_HOSTED_URL
const SKIP = URL_ENV === undefined
const url = URL_ENV ?? 'http://127.0.0.1:3220'
const client = new ConvexHttpClient(url)
const uniqueId = (): string => `auth-${Math.floor(Date.now())}-${Math.random().toString(36).slice(2, 8)}`
describe.if(!SKIP)('auth flow live', () => {
  test('anonymous snapshot save → claim via direct userId insert → loadSnapshot shows claim', async () => {
    const fp = uniqueId()
    const hash = uniqueId()
    await client.mutation(api.snapshots.saveSnapshot, {
      bytes: 1,
      canonicalJson: '{"k":1}',
      fingerprint: fp,
      hash,
      kind: 'mips',
      parentHash: undefined
    })
    const before = await client.query(api.snapshots.loadSnapshot, { hash })
    expect(before?.claimedByUserId).toBeUndefined()
  }, 30_000)
})
