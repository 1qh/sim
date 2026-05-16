/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
// @ts-nocheck
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
var g =
  (typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis) || new Function('return this')()
var ns = g.__stryker__ || (g.__stryker__ = {})
if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
  ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__
}
function retrieveNS() {
  return ns
}
stryNS_9fa48 = retrieveNS
return retrieveNS();
}
stryNS_9fa48()
function stryCov_9fa48() {
  var ns = stryNS_9fa48()
  var cov =
    ns.mutantCoverage ||
    (ns.mutantCoverage = {
      static: {},
      perTest: {}
    })
  function cover() {
    var c = cov.static
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {}
    }
    var a = arguments
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1
    }
  }
  stryCov_9fa48 = cover
  cover.apply(null, arguments)
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48()
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')')
      }
      return true
    }
    return false
  }
  stryMutAct_9fa48 = isActive
  return isActive(id)
}
import { blake3 } from '@noble/hashes/blake3.js'
import canonicalize from 'canonicalize'
import { applyPatch, createPatch } from 'rfc6902'
interface Snapshot<T> {
  hash: string
  payload: T
}
const toCanonicalBytes = <T>(value: T): Uint8Array => {
  if (stryMutAct_9fa48('0')) {
  } else {
    stryCov_9fa48('0')
    const json = canonicalize(value)
    if (
      stryMutAct_9fa48('3')
        ? json !== undefined
        : stryMutAct_9fa48('2')
          ? false
          : stryMutAct_9fa48('1')
            ? true
            : (stryCov_9fa48('1', '2', '3'), json === undefined)
    )
      throw new Error(stryMutAct_9fa48('4') ? '' : (stryCov_9fa48('4'), 'canonicalize: value not JSON-serializable'))
    return new TextEncoder().encode(json)
  }
}
const hashBytes = (bytes: Uint8Array): string => {
  if (stryMutAct_9fa48('5')) {
  } else {
    stryCov_9fa48('5')
    const digest = blake3(bytes)
    let out = stryMutAct_9fa48('6') ? 'Stryker was here!' : (stryCov_9fa48('6'), '')
    for (const d of digest)
      stryMutAct_9fa48('7')
        ? (out -= d.toString(16).padStart(2, '0'))
        : (stryCov_9fa48('7'), (out += d.toString(16).padStart(2, stryMutAct_9fa48('8') ? '' : (stryCov_9fa48('8'), '0'))))
    return out
  }
}
const hashValue = stryMutAct_9fa48('9')
  ? () => undefined
  : (stryCov_9fa48('9'),
    (() => {
      const hashValue = <T>(value: T): string => hashBytes(toCanonicalBytes(value))
      return hashValue
    })())
const encode = stryMutAct_9fa48('10')
  ? () => undefined
  : (stryCov_9fa48('10'),
    (() => {
      const encode = <T>(value: T): Snapshot<T> =>
        stryMutAct_9fa48('11')
          ? {}
          : (stryCov_9fa48('11'),
            {
              hash: hashValue(value),
              payload: value
            })
      return encode
    })())
const decode = <T>(snap: Snapshot<T>): T => {
  if (stryMutAct_9fa48('12')) {
  } else {
    stryCov_9fa48('12')
    const recomputed = hashValue(snap.payload)
    if (
      stryMutAct_9fa48('15')
        ? recomputed === snap.hash
        : stryMutAct_9fa48('14')
          ? false
          : stryMutAct_9fa48('13')
            ? true
            : (stryCov_9fa48('13', '14', '15'), recomputed !== snap.hash)
    )
      throw new Error(
        stryMutAct_9fa48('16')
          ? ''
          : (stryCov_9fa48('16'), `decode: hash mismatch (expected ${snap.hash}, got ${recomputed})`)
      )
    return snap.payload
  }
}
type Patch = ReturnType<typeof createPatch>
const diff = stryMutAct_9fa48('17')
  ? () => undefined
  : (stryCov_9fa48('17'),
    (() => {
      const diff = <T>(from: T, to: T): Patch => createPatch(from, to)
      return diff
    })())
const applyDiff = <T>(base: T, patch: Patch): T => {
  if (stryMutAct_9fa48('18')) {
  } else {
    stryCov_9fa48('18')
    const clone = structuredClone(base)
    const errors = applyPatch(clone, patch)
    for (const e of errors)
      if (
        stryMutAct_9fa48('21')
          ? e === null
          : stryMutAct_9fa48('20')
            ? false
            : stryMutAct_9fa48('19')
              ? true
              : (stryCov_9fa48('19', '20', '21'), e !== null)
      )
        throw new Error(stryMutAct_9fa48('22') ? '' : (stryCov_9fa48('22'), `applyPatch failed: ${e.message}`))
    return clone
  }
}
export { applyDiff, decode, diff, encode, hashBytes, hashValue, toCanonicalBytes }
export type { Patch, Snapshot }
