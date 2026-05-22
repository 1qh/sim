import { describe, expect, test } from 'bun:test'
import { replay, run } from './index'

interface CounterV1 {
  v: number
}
interface CounterV2 {
  schemaVersion: 2
  v: number
}
interface CounterV3 {
  ops: number
  schemaVersion: 3
  v: number
}
const reducerV1 = (s: CounterV1, e: 'dec' | 'inc'): CounterV1 => ({ v: e === 'inc' ? s.v + 1 : s.v - 1 })
const reducerV2 = (s: CounterV2, e: 'dec' | 'inc'): CounterV2 => ({ schemaVersion: 2, v: e === 'inc' ? s.v + 1 : s.v - 1 })
const reducerV3 = (s: CounterV3, e: 'dec' | 'inc'): CounterV3 => ({
  ops: s.ops + 1,
  schemaVersion: 3,
  v: e === 'inc' ? s.v + 1 : s.v - 1
})
const events: ('dec' | 'inc')[] = ['inc', 'inc', 'dec', 'inc', 'inc']
describe('schema v1 replay', () => {
  test('events deterministically reproduce final state', () => {
    const a = run({ initial: { v: 0 }, reducer: reducerV1 }, events)
    const b = replay({ initial: { v: 0 }, reducer: reducerV1 }, events)
    expect(a.hashes).toEqual(b.hashes)
    expect(a.states.at(-1)?.v).toBe(3)
  })
})
describe('schema v2 replay', () => {
  test('schemaVersion tag survives replay', () => {
    const trace = replay({ initial: { schemaVersion: 2, v: 0 }, reducer: reducerV2 }, events)
    expect(trace.states.at(-1)?.schemaVersion).toBe(2)
    expect(trace.states.at(-1)?.v).toBe(3)
  })
})
describe('schema v3 replay', () => {
  test('augmented op counter increments per event', () => {
    const trace = replay({ initial: { ops: 0, schemaVersion: 3, v: 0 }, reducer: reducerV3 }, events)
    expect(trace.states.at(-1)?.ops).toBe(events.length)
  })
})
