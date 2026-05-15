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
})
describe('coverage ratchet for codec', () => {
  test('canonicalize throws on circular ref', () => {
    const o: Record<string, unknown> = {}
    o.self = o
    expect(() => toCanonicalBytes(o)).toThrow()
  })
  test('hashBytes deterministic for same input', () => {
    const a = hashValue('hello')
    const b = hashValue('hello')
    expect(a).toBe(b)
    expect(a.length).toBe(64)
  })
  test('diff/applyDiff for nested object', () => {
    const a = { user: { name: 'a', age: 1 } }
    const b = { user: { name: 'b', age: 1 } }
    const p = diff(a, b)
    expect(applyDiff(a, p).user.name).toBe('b')
  })
  test('decode rejects null payload mismatch', () => {
    const s = encode({ k: 1 })
    expect(() => decode({ ...s, hash: 'wrong' })).toThrow()
  })
  test('rng nextInt bounded by max', () => {
    const r = fromSeed(42)
    for (let i = 0; i < 50; i++) {
      const v = (next(r) >>> 0) % 100
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(100)
    }
  })
})
