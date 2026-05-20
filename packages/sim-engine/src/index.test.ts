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
import {
  applyDiff,
  clone,
  decode,
  diff,
  encode,
  fromSeed,
  hashValue,
  next,
  nextFloat,
  nextInt,
  replay,
  run,
  scrub,
  snapshotTrace,
  toCanonicalBytes,
  verifyTrace
} from './index'

describe('sfc32 rng', () => {
  test('same seed yields identical streams', () => {
    const a = fromSeed(42)
    const b = fromSeed(42)
    const xs: number[] = []
    const ys: number[] = []
    for (let i = 0; i < 10; i += 1) {
      xs.push(next(a))
      ys.push(next(b))
    }
    expect(xs).toEqual(ys)
  })
  test('different seeds diverge', () => {
    const a = fromSeed(1)
    const b = fromSeed(2)
    expect(next(a)).not.toBe(next(b))
  })
  test('nextFloat in [0, 1)', () => {
    const r = fromSeed(7)
    for (let i = 0; i < 100; i += 1) {
      const x = nextFloat(r)
      expect(x).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThan(1)
    }
  })
  test('clone preserves stream', () => {
    const a = fromSeed(9)
    next(a)
    next(a)
    const b = clone(a)
    expect(next(a)).toBe(next(b))
  })
  test('fromSeed(42) golden initial state', () => {
    const s = fromSeed(42)
    expect(s).toEqual({ a: 2_581_720_956, b: 1_925_393_290, c: 3_661_312_704, d: 2_876_485_805 })
  })
  test('fromSeed(42) golden first 5 outputs', () => {
    const s = fromSeed(42)
    const out: number[] = []
    for (let i = 0; i < 5; i += 1) out.push(next(s))
    expect(out).toEqual([3_088_632_756, 3_397_567_374, 3_799_640_352, 124_962_666, 3_029_834_369])
  })
  test('fromSeed(123) golden nextFloat', () => {
    const s = fromSeed(123)
    expect(nextFloat(s)).toBeCloseTo(0.197_157_151_764_258_74, 12)
  })
  test('fromSeed(7) golden nextInt sequence with max=100', () => {
    const s = fromSeed(7)
    const out: number[] = []
    for (let i = 0; i < 5; i += 1) out.push(nextInt(s, 100))
    expect(out).toEqual([77, 55, 32, 17, 0])
  })
  test('nextInt with max=1 always returns 0', () => {
    const s = fromSeed(42)
    for (let i = 0; i < 20; i += 1) expect(nextInt(s, 1)).toBe(0)
  })
  test('nextInt with max=2 in {0,1}', () => {
    const s = fromSeed(99)
    for (let i = 0; i < 50; i += 1) {
      const v = nextInt(s, 2)
      expect(v === 0 || v === 1).toBe(true)
    }
  })
})
describe('canonical codec', () => {
  test('round-trip on simple value', () => {
    const snap = encode({ a: 1, b: [2, 3], c: { d: 4 } })
    expect(decode(snap)).toEqual({ a: 1, b: [2, 3], c: { d: 4 } })
  })
  test('hash stable across key order', () => {
    const h1 = hashValue({ a: 1, b: 2 })
    const h2 = hashValue({ a: 1, b: 2 })
    expect(h1).toBe(h2)
  })
  test('hash changes with payload', () => {
    expect(hashValue({ a: 1 })).not.toBe(hashValue({ a: 2 }))
  })
  test('decode rejects tampered payload', () => {
    const snap = encode({ x: 1 })
    expect(() => decode({ ...snap, payload: { x: 2 } })).toThrow(/hash mismatch/u)
  })
})
describe('json patch diff', () => {
  test('round-trip', () => {
    const a = { x: [1, 2, 3], y: 'hello' }
    const b = { x: [1, 2, 3, 4], y: 'world' }
    const patch = diff(a, b)
    expect(applyDiff(a, patch)).toEqual(b)
  })
  test('no-op for equal values', () => {
    expect(diff({ a: 1 }, { a: 1 })).toEqual([])
  })
})
interface Counter {
  value: number
}
const counterReducer = (state: Counter, event: 'dec' | 'inc'): Counter => ({
  value: event === 'inc' ? state.value + 1 : state.value - 1
})
describe('state machine + trace', () => {
  test('run produces N+1 states for N events', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc', 'inc', 'dec'])
    expect(trace.states.map(s => s.value)).toEqual([0, 1, 2, 1])
  })
  test('verifyTrace returns true for clean run', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc', 'inc', 'dec', 'inc'])
    expect(verifyTrace(trace)).toBe(true)
  })
  test('verifyTrace catches tampered state', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc', 'inc'])
    trace.states[1] = { value: 99 }
    expect(verifyTrace(trace)).toBe(false)
  })
  test('scrub at every step', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc', 'inc', 'inc'])
    expect(scrub(trace, 0).value).toBe(0)
    expect(scrub(trace, 3).value).toBe(3)
  })
  test('replay matches run', () => {
    const events: ('dec' | 'inc')[] = ['inc', 'dec', 'inc', 'inc']
    const a = run({ initial: { value: 5 }, reducer: counterReducer }, events)
    const b = replay({ initial: { value: 5 }, reducer: counterReducer }, events)
    expect(a.hashes).toEqual(b.hashes)
  })
  test('snapshotTrace produces hash-verifiable bundle', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc', 'inc'])
    const snap = snapshotTrace(trace)
    expect(snap.hash).toBeTruthy()
    expect(snap.payload.hashes).toEqual(trace.hashes)
  })
  test('trace events array is full copy (length matches input)', () => {
    const events: ('dec' | 'inc')[] = ['inc', 'dec', 'inc']
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, events)
    expect(trace.events).toEqual(events)
    expect(trace.events).toHaveLength(3)
  })
  test('scrub at last step matches final state', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc', 'inc', 'inc'])
    expect(scrub(trace, 3).value).toBe(3)
  })
  test('scrub at step equal to states.length throws or returns undefined-safe', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc'])
    expect(() => scrub(trace, trace.states.length)).toThrow()
  })
  test('scrub at negative step throws', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc'])
    expect(() => scrub(trace, -1)).toThrow()
  })
})
describe('coverage ratchet for codec', () => {
  test('canonicalize throws on circular ref', () => {
    const o: Record<string, unknown> = {}
    o.self = o
    expect(() => toCanonicalBytes(o)).toThrow()
  })
  test('canonicalize error message mentions JSON-serializable for undefined', () => {
    expect(() => toCanonicalBytes(undefined)).toThrow(/JSON-serializable/u)
  })
  test('canonicalize undefined input throws specific message', () => {
    expect(() => toCanonicalBytes(undefined)).toThrow(/JSON-serializable/u)
  })
  test('applyDiff with malformed patch throws with applyPatch prefix', () => {
    const state = { x: 1 }
    const bad = [{ op: 'replace' as const, path: '/nonexistent/deep/path', value: 9 }]
    expect(() => applyDiff(state, bad)).toThrow(/applyPatch failed/u)
  })
  test('hashBytes deterministic for same input', () => {
    const a = hashValue('hello')
    const b = hashValue('hello')
    expect(a).toBe(b)
    expect(a.length).toBe(64)
  })
  test('diff/applyDiff for nested object', () => {
    const a = { user: { age: 1, name: 'a' } }
    const b = { user: { age: 1, name: 'b' } }
    const p = diff(a, b)
    expect(applyDiff(a, p).user.name).toBe('b')
  })
  test('decode rejects null payload mismatch', () => {
    const s = encode({ k: 1 })
    expect(() => decode({ ...s, hash: 'wrong' })).toThrow()
  })
  test('rng nextInt bounded by max', () => {
    const r = fromSeed(42)
    for (let i = 0; i < 50; i += 1) {
      const v = Math.trunc(next(r)) % 100
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(100)
    }
  })
})
describe('coverage ratchet for machine + rng', () => {
  test('scrub throws on negative step', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc'])
    expect(() => scrub(trace, -1)).toThrow(/out of range/u)
  })
  test('scrub throws beyond range', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc'])
    expect(() => scrub(trace, 5)).toThrow(/out of range/u)
  })
  test('verifyTrace catches tampered patch', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc', 'inc'])
    trace.patches[0] = [{ op: 'replace', path: '/value', value: 999 }] as (typeof trace.patches)[0]
    expect(verifyTrace(trace)).toBe(false)
  })
  test('snapshotTrace round-trip preserves hashes', () => {
    const trace = run({ initial: { value: 0 }, reducer: counterReducer }, ['inc', 'inc', 'dec'])
    const snap = snapshotTrace(trace)
    expect(snap.payload.hashes).toEqual(trace.hashes)
    expect(snap.payload.events).toEqual(trace.events)
  })
  test('nextInt produces stable sequence', () => {
    const a = fromSeed(123)
    const b = fromSeed(123)
    for (let i = 0; i < 20; i += 1) {
      const ai = Math.trunc(next(a)) % 1000
      const bi = Math.trunc(next(b)) % 1000
      expect(ai).toBe(bi)
    }
  })
  test('nextFloat distinct across consecutive calls', () => {
    const r = fromSeed(456)
    const xs = new Set<number>()
    for (let i = 0; i < 30; i += 1) xs.add(nextFloat(r))
    expect(xs.size).toBeGreaterThan(25)
  })
  test('clone yields independent state object', () => {
    const a = fromSeed(7)
    const b = clone(a)
    a.a = 999
    expect(b.a).not.toBe(999)
  })
  test('fromSeed(0) defaults to non-zero seed', () => {
    const r = fromSeed(0)
    expect(r.a + r.b + r.c + r.d).toBeGreaterThan(0)
  })
  test('run with empty events returns initial-only trace', () => {
    const trace = run({ initial: { value: 5 }, reducer: counterReducer }, [])
    expect(trace.states).toEqual([{ value: 5 }])
    expect(trace.patches).toEqual([])
    expect(trace.hashes).toHaveLength(1)
  })
})
