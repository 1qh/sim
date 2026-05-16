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
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters */
import { hashValue, toCanonicalBytes } from '@sim/sim-engine'
import { gunzipSync, gzipSync } from 'node:zlib'
interface ShareEncoding {
  bytes: number
  fragment: string | undefined
  hash: string
  tier: Tier
}
type Tier = 'convex' | 'fragment'
const URL_FRAGMENT_LIMIT_BYTES = 1024
const base64UrlEncode = (bytes: Uint8Array): string => {
  let bin = ''
  for (const b of bytes) bin += String.fromCodePoint(b)
  const b64 = btoa(bin)
  return b64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}
const base64UrlDecode = (s: string): Uint8Array => {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4))
  const b64 = (s + pad).replaceAll('-', '+').replaceAll('_', '/')
  const bin = atob(b64)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.codePointAt(i) ?? 0
  return out
}
const encodeShare = <T>(value: T): ShareEncoding => {
  const canonical = toCanonicalBytes(value)
  const compressed = new Uint8Array(gzipSync(canonical))
  const fragment = base64UrlEncode(compressed)
  const hash = hashValue(value)
  if (fragment.length <= URL_FRAGMENT_LIMIT_BYTES) return { bytes: compressed.length, fragment, hash, tier: 'fragment' }
  return { bytes: compressed.length, fragment: undefined, hash, tier: 'convex' }
}
const decodeFragment = <T>(fragment: string): T => {
  const compressed = base64UrlDecode(fragment)
  const canonical = new Uint8Array(gunzipSync(compressed))
  const json = new TextDecoder().decode(canonical)
  return JSON.parse(json) as T
}
const permalinkPath = (hash: string): string => `/s/${hash}`
const isLargePayload = (encoding: ShareEncoding): boolean => encoding.tier === 'convex'
export {
  base64UrlDecode,
  base64UrlEncode,
  decodeFragment,
  encodeShare,
  isLargePayload,
  permalinkPath,
  URL_FRAGMENT_LIMIT_BYTES
}
export type { ShareEncoding, Tier }
