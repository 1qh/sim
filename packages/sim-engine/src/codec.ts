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
/* eslint-disable @typescript-eslint/no-unnecessary-type-parameters, no-namespace */
import { blake3 } from '@noble/hashes/blake3.js'
import canonicalize from 'canonicalize'
import { applyPatch, createPatch } from 'rfc6902'
interface Snapshot<T> {
  hash: string
  payload: T
}
const toCanonicalBytes = <T>(value: T): Uint8Array => {
  const json = canonicalize(value)
  if (json === undefined) throw new Error('canonicalize: value not JSON-serializable')
  return new TextEncoder().encode(json)
}
const hashBytes = (bytes: Uint8Array): string => {
  const digest = blake3(bytes)
  let out = ''
  for (const d of digest) out += d.toString(16).padStart(2, '0')
  return out
}
const hashValue = <T>(value: T): string => hashBytes(toCanonicalBytes(value))
const encode = <T>(value: T): Snapshot<T> => ({ hash: hashValue(value), payload: value })
const decode = <T>(snap: Snapshot<T>): T => {
  const recomputed = hashValue(snap.payload)
  if (recomputed !== snap.hash) throw new Error(`decode: hash mismatch (expected ${snap.hash}, got ${recomputed})`)
  return snap.payload
}
type Patch = ReturnType<typeof createPatch>
const diff = <T>(from: T, to: T): Patch => createPatch(from, to)
const applyDiff = <T>(base: T, patch: Patch): T => {
  const clone = structuredClone(base)
  const errors = applyPatch(clone, patch)
  for (const e of errors) if (e !== null) throw new Error(`applyPatch failed: ${e.message}`)
  return clone
}
export { applyDiff, decode, diff, encode, hashBytes, hashValue, toCanonicalBytes }
export type { Patch, Snapshot }
