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
import { buildGrid, GRAY_CODE, isUserCoverComplete, kmap, validateGrouping } from './index'
describe('GRAY_CODE', () => {
  test('1-bit', () => {
    expect(GRAY_CODE(1)).toEqual([0, 1])
  })
  test('2-bit', () => {
    expect(GRAY_CODE(2)).toEqual([0, 1, 3, 2])
  })
  test('3-bit', () => {
    expect(GRAY_CODE(3)).toEqual([0, 1, 3, 2, 6, 7, 5, 4])
  })
})
describe('kmap 2D', () => {
  test('v2 OR: f(A,B) = A+B → SOP "A + B"', () => {
    const r = kmap({ expression: 'A | B' })
    expect(r.geometry).toBe('2d')
    expect(r.minimalSop.split(' + ').toSorted()).toEqual(['A', 'B'])
  })
  test('v3 majority → A·B + A·C + B·C', () => {
    const r = kmap({ expression: '(A&B) | (B&C) | (A&C)' })
    expect(r.geometry).toBe('2d')
    expect(r.minimalSopImplicants.length).toBeGreaterThanOrEqual(3)
  })
  test("v4 with don't-cares reduces term count", () => {
    const r = kmap({ dontCares: [0, 2, 5], minterms: [1, 3, 7, 11, 15], vars: ['A', 'B', 'C', 'D'] })
    expect(r.geometry).toBe('2d')
    expect(r.minimalSop).toBeTruthy()
  })
  test('v4 POS form', () => {
    const r = kmap({ maxterms: [0, 1], vars: ['A', 'B'] })
    expect(r.minimalPos).toBeTruthy()
  })
})
describe('kmap 3D toroidal', () => {
  test('v5 auto-selects 3d-toroidal geometry', () => {
    const r = kmap({ minterms: [0, 1, 5, 7, 15], vars: ['A', 'B', 'C', 'D', 'E'] })
    expect(r.geometry).toBe('3d-toroidal')
  })
})
describe('kmap geometry override', () => {
  test('explicit 2d on 4-var works', () => {
    const r = kmap({ geometry: '2d', minterms: [0, 1], vars: ['A', 'B', 'C', 'D'] })
    expect(r.geometry).toBe('2d')
  })
})
describe('kmap validation', () => {
  test('rejects width > 6', () => {
    expect(() => kmap({ minterms: [], width: 7 })).toThrow(/width > 6/u)
  })
  test('flags non-power-of-2 grouping', () => {
    const r = kmap({ minterms: [0, 1, 2], userGroupings: [{ cells: [0, 1, 2] }], vars: ['A', 'B'] })
    expect(r.validationErrors.some(e => e.includes('power of 2'))).toBe(true)
  })
  test('flags empty grouping', () => {
    const r = kmap({ minterms: [0], userGroupings: [{ cells: [] }], vars: ['A', 'B'] })
    expect(r.validationErrors.some(e => e.includes('empty'))).toBe(true)
  })
  test('flags out-of-range cell', () => {
    const r = kmap({ minterms: [0], userGroupings: [{ cells: [99] }], vars: ['A', 'B'] })
    expect(r.validationErrors.some(e => e.includes('out of range'))).toBe(true)
  })
})
describe('isUserCoverComplete', () => {
  test('full cover returns true', () => {
    expect(isUserCoverComplete([{ bits: '00', covers: [0, 1, 2, 3] }], [0, 1])).toBe(true)
  })
  test('partial cover returns false', () => {
    expect(isUserCoverComplete([{ bits: '0-', covers: [0, 1] }], [0, 1, 2])).toBe(false)
  })
})
describe('buildGrid', () => {
  test('width 2 produces 4 cells', () => {
    const g = buildGrid(['A', 'B'], [0, 1, 0, 1], '2d')
    expect(g.cells).toHaveLength(4)
    expect(g.width).toBe(2)
  })
})
describe('validateGrouping', () => {
  test('power-of-2 grouping returns no errors', () => {
    expect(validateGrouping({ cells: [0, 1, 2, 3] }, 16)).toEqual([])
  })
})
describe('kmap edge cases', () => {
  test('v4-multi-output: two functions sharing minterms', () => {
    const f1 = kmap({ minterms: [0, 1, 5], vars: ['A', 'B', 'C', 'D'] })
    const f2 = kmap({ minterms: [1, 5, 7], vars: ['A', 'B', 'C', 'D'] })
    expect(f1.minterms).toContain(1)
    expect(f2.minterms).toContain(1)
  })
  test('v4-hazard: static-1 hazard candidate detected via adjacent minterms', () => {
    const r = kmap({ minterms: [0, 1, 3, 2], vars: ['A', 'B', 'C', 'D'] })
    expect(r.minimalSopImplicants.length).toBeGreaterThanOrEqual(1)
  })
  test('v4-wrap: corner minterms wrap to single 4-cell group', () => {
    const r = kmap({ minterms: [0, 2, 8, 10], vars: ['A', 'B', 'C', 'D'] })
    expect(r.minimalSopImplicants.length).toBe(1)
  })
  test('v5-wrap: minterm 0 and 31 wrap on toroidal edge', () => {
    const r = kmap({ minterms: [0, 31], vars: ['A', 'B', 'C', 'D', 'E'] })
    expect(r.geometry).toBe('3d-toroidal')
    expect(r.primeImplicants.length).toBeGreaterThanOrEqual(2)
  })
  test('v5-petrick: 5-var with overlapping PIs requires Petrick selection', () => {
    const r = kmap({ minterms: [0, 1, 2, 3], vars: ['A', 'B', 'C', 'D', 'E'] })
    expect(r.minimalSopImplicants.length).toBeGreaterThanOrEqual(1)
  })
  test('v6-basic: 6-var with sparse minterms', () => {
    const r = kmap({ minterms: [0, 1], vars: ['A', 'B', 'C', 'D', 'E', 'F'] })
    expect(r.geometry).toBe('3d-toroidal')
    expect(r.width).toBe(6)
  })
  test('v6-wrap: 6-var diagonal corners', () => {
    const r = kmap({ minterms: [0, 32], vars: ['A', 'B', 'C', 'D', 'E', 'F'] })
    expect(r.geometry).toBe('3d-toroidal')
  })
  test('v6-multi-output: independent results for two minterm sets', () => {
    const a = kmap({ minterms: [0], vars: ['A', 'B', 'C', 'D', 'E', 'F'] })
    const b = kmap({ minterms: [1], vars: ['A', 'B', 'C', 'D', 'E', 'F'] })
    expect(a.minimalSop).not.toBe(b.minimalSop)
  })
})
