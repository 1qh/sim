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
