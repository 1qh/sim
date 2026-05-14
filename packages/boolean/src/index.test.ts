import type { Arbitrary } from 'fast-check'
import { describe, expect, test } from 'bun:test'
import { assert, integer, property, uniqueArray } from 'fast-check'
import { evalExpr, findPrimeImplicants, minimize, parse, solve, sortedVars, truthTable } from './index'
describe('parser', () => {
  test('single variable', () => {
    expect(parse('A').kind).toBe('var')
  })
  test('AND with multiple notations', () => {
    const e1 = parse('A AND B')
    const e2 = parse('A & B')
    const e3 = parse('A·B')
    expect(truthTable(e1)).toEqual(truthTable(e2))
    expect(truthTable(e2)).toEqual(truthTable(e3))
  })
  test('OR with multiple notations', () => {
    const e1 = parse('A OR B')
    const e2 = parse('A | B')
    const e3 = parse('A + B')
    expect(truthTable(e1)).toEqual(truthTable(e2))
    expect(truthTable(e2)).toEqual(truthTable(e3))
  })
  test('NOT precedence higher than AND', () => {
    const e = parse('!A & B')
    expect(evalExpr(e, { A: 0, B: 1 })).toBe(1)
    expect(evalExpr(e, { A: 1, B: 1 })).toBe(0)
  })
  test('AND precedence higher than OR', () => {
    const e = parse('A | B & C')
    expect(evalExpr(e, { A: 0, B: 1, C: 1 })).toBe(1)
    expect(evalExpr(e, { A: 0, B: 1, C: 0 })).toBe(0)
    expect(evalExpr(e, { A: 1, B: 0, C: 0 })).toBe(1)
  })
  test('XOR', () => {
    const e = parse('A ^ B')
    expect(evalExpr(e, { A: 0, B: 0 })).toBe(0)
    expect(evalExpr(e, { A: 0, B: 1 })).toBe(1)
    expect(evalExpr(e, { A: 1, B: 0 })).toBe(1)
    expect(evalExpr(e, { A: 1, B: 1 })).toBe(0)
  })
  test('parentheses', () => {
    const e = parse('(A | B) & C')
    expect(evalExpr(e, { A: 0, B: 1, C: 1 })).toBe(1)
    expect(evalExpr(e, { A: 0, B: 1, C: 0 })).toBe(0)
  })
})
describe('truth table', () => {
  test('2-var AND', () => {
    expect(truthTable(parse('A & B'))).toEqual([0, 0, 0, 1])
  })
  test('2-var OR', () => {
    expect(truthTable(parse('A | B'))).toEqual([0, 1, 1, 1])
  })
  test('3-var majority', () => {
    expect(truthTable(parse('(A & B) | (B & C) | (A & C)'))).toEqual([0, 0, 0, 1, 0, 1, 1, 1])
  })
})
describe('Quine-McCluskey', () => {
  test('2-var: f = A·B + A·!B reduces to A', () => {
    const result = solve({ expression: 'A&B | A&!B' })
    expect(result.minimalSop).toBe('A')
  })
  test('3-var: minterms 1,3,7,11,15 with 4 vars and dontcares', () => {
    const result = solve({ minterms: [1, 3, 7, 11, 15], vars: ['A', 'B', 'C', 'D'] })
    expect(result.primeImplicants.length).toBeGreaterThanOrEqual(2)
  })
  test('all zeros → 0', () => {
    const result = solve({ minterms: [], vars: ['A', 'B'] })
    expect(result.minimalSop).toBe('0')
  })
  test('all ones (2-var) → 1', () => {
    const result = solve({ minterms: [0, 1, 2, 3], vars: ['A', 'B'] })
    expect(result.minimalSop).toBe('1')
  })
  test('XOR is irreducible (2-var)', () => {
    const result = solve({ expression: 'A ^ B' })
    expect(result.primeImplicants).toHaveLength(2)
  })
  test('don’t cares pull cover up to constant when all 1s + dcs span the cube', () => {
    const result = solve({ dontCares: [2, 3], minterms: [0, 1], vars: ['A', 'B'] })
    expect(result.minimalSop).toBe('1')
  })
  test('don’t cares reduce a partial function: f(A,B,C) = m(1) + dc(0,3,5)', () => {
    const result = solve({ dontCares: [0, 3, 5], minterms: [1], vars: ['A', 'B', 'C'] })
    expect(result.minimalSopImplicants).toHaveLength(1)
  })
})
const u32arb = (max: number): Arbitrary<number> => integer({ max, min: 0 })
const widthArb = (): Arbitrary<number> => integer({ max: 4, min: 2 })
describe('property: minimized SOP truth-table-equivalent to original', () => {
  test('random 4-var minterm set produces equivalent truth table', () => {
    assert(
      property(uniqueArray(u32arb(15), { maxLength: 16 }), mins => {
        const result = solve({ minterms: [...mins], vars: ['A', 'B', 'C', 'D'] })
        const rebuiltTT = result.truthTable
        const minSet = new Set(mins)
        for (let i = 0; i < 16; i += 1) {
          const expected = minSet.has(i) ? 1 : 0
          if (rebuiltTT[i] !== expected) return false
        }
        return true
      })
    )
  })
})
describe('sortedVars', () => {
  test('alphabetical order', () => {
    const e = parse('C & A | B')
    expect(sortedVars(e)).toEqual(['A', 'B', 'C'])
  })
})
describe('findPrimeImplicants', () => {
  test('returns one prime for a constant function', () => {
    const primes = findPrimeImplicants([0, 1, 2, 3], [], 2)
    expect(primes).toHaveLength(1)
    expect(primes[0].bits).toBe('--')
  })
})
describe('minimize empty inputs', () => {
  test('no minterms returns no implicants', () => {
    expect(minimize([], [], 3)).toEqual([])
  })
})
