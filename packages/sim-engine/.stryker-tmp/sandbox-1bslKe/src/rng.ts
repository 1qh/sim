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
interface RngState {
  a: number
  b: number
  c: number
  d: number
}
const TWO_POW_32 = 4_294_967_296
const u32 = stryMutAct_9fa48('67')
  ? () => undefined
  : (stryCov_9fa48('67'),
    (() => {
      const u32 = (n: number): number =>
        stryMutAct_9fa48('68')
          ? ((n % TWO_POW_32) + TWO_POW_32) * TWO_POW_32
          : (stryCov_9fa48('68'),
            (stryMutAct_9fa48('69')
              ? (n % TWO_POW_32) - TWO_POW_32
              : (stryCov_9fa48('69'),
                (stryMutAct_9fa48('70') ? n * TWO_POW_32 : (stryCov_9fa48('70'), n % TWO_POW_32)) + TWO_POW_32)) %
              TWO_POW_32)
      return u32
    })())
const fromSeed = (seed: number): RngState => {
  if (stryMutAct_9fa48('71')) {
  } else {
    stryCov_9fa48('71')
    let s = stryMutAct_9fa48('74')
      ? u32(seed) && 1
      : stryMutAct_9fa48('73')
        ? false
        : stryMutAct_9fa48('72')
          ? true
          : (stryCov_9fa48('72', '73', '74'), u32(seed) || 1)
    const step = (): number => {
      if (stryMutAct_9fa48('75')) {
      } else {
        stryCov_9fa48('75')
        s = u32(stryMutAct_9fa48('76') ? s - 0x6d_2b_79_f5 : (stryCov_9fa48('76'), s + 0x6d_2b_79_f5))
        let t = s
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= stryMutAct_9fa48('77')
          ? t - Math.imul(t ^ (t >>> 7), t | 61)
          : (stryCov_9fa48('77'), t + Math.imul(t ^ (t >>> 7), t | 61))
        return u32(t ^ (t >>> 14))
      }
    }
    return stryMutAct_9fa48('78')
      ? {}
      : (stryCov_9fa48('78'),
        {
          a: step(),
          b: step(),
          c: step(),
          d: step()
        })
  }
}
const next = (state: RngState): number => {
  if (stryMutAct_9fa48('79')) {
  } else {
    stryCov_9fa48('79')
    const t = u32(stryMutAct_9fa48('80') ? state.a - state.b : (stryCov_9fa48('80'), state.a + state.b))
    state.a = u32(state.b ^ (state.b >>> 9))
    state.b = u32(stryMutAct_9fa48('81') ? state.c - (state.c << 3) : (stryCov_9fa48('81'), state.c + (state.c << 3)))
    state.c = u32((state.c << 21) | (state.c >>> 11))
    state.d = u32(stryMutAct_9fa48('82') ? state.d - 1 : (stryCov_9fa48('82'), state.d + 1))
    const out = u32(stryMutAct_9fa48('83') ? t - state.d : (stryCov_9fa48('83'), t + state.d))
    state.c = u32(stryMutAct_9fa48('84') ? state.c - t : (stryCov_9fa48('84'), state.c + t))
    return out
  }
}
const nextFloat = stryMutAct_9fa48('85')
  ? () => undefined
  : (stryCov_9fa48('85'),
    (() => {
      const nextFloat = (state: RngState): number =>
        stryMutAct_9fa48('86') ? next(state) * TWO_POW_32 : (stryCov_9fa48('86'), next(state) / TWO_POW_32)
      return nextFloat
    })())
const nextInt = stryMutAct_9fa48('87')
  ? () => undefined
  : (stryCov_9fa48('87'),
    (() => {
      const nextInt = (state: RngState, max: number): number =>
        Math.floor(stryMutAct_9fa48('88') ? nextFloat(state) / max : (stryCov_9fa48('88'), nextFloat(state) * max))
      return nextInt
    })())
const clone = stryMutAct_9fa48('89')
  ? () => undefined
  : (stryCov_9fa48('89'),
    (() => {
      const clone = (state: RngState): RngState =>
        stryMutAct_9fa48('90')
          ? {}
          : (stryCov_9fa48('90'),
            {
              a: state.a,
              b: state.b,
              c: state.c,
              d: state.d
            })
      return clone
    })())
export { clone, fromSeed, next, nextFloat, nextInt }
export type { RngState }
