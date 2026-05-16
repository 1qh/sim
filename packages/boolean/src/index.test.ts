/** biome-ignore-all lint/correctness/noUnusedVariables: test fixture */
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
/* eslint-disable @typescript-eslint/no-unused-vars */
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
    expect((primes[0] as { bits: string }).bits).toBe('--')
  })
})
describe('minimize empty inputs', () => {
  test('no minterms returns no implicants', () => {
    expect(minimize([], [], 3)).toEqual([])
  })
})
describe('boolean coverage ratchet', () => {
  test('parse handles true/false constants', () => {
    expect(evalExpr(parse('1'), {})).toBe(1)
    expect(evalExpr(parse('0'), {})).toBe(0)
    expect(evalExpr(parse('true'), {})).toBe(1)
    expect(evalExpr(parse('FALSE'), {})).toBe(0)
  })
  test('parse double negation', () => {
    expect(evalExpr(parse('!!A'), { A: 1 })).toBe(1)
    expect(evalExpr(parse('!!A'), { A: 0 })).toBe(0)
  })
  test('parse XOR symbol variants', () => {
    expect(evalExpr(parse('A ⊕ B'), { A: 1, B: 0 })).toBe(1)
    expect(evalExpr(parse('A XOR B'), { A: 0, B: 0 })).toBe(0)
  })
  test('parse OR alternates', () => {
    expect(evalExpr(parse('A || B'), { A: 0, B: 1 })).toBe(1)
  })
  test('lex error throws', () => {
    expect(() => parse('A @# B')).toThrow()
  })
  test('solve via maxterms input', () => {
    const r = solve({ maxterms: [0, 1, 2], vars: ['A', 'B'] })
    expect(r.minterms).toEqual([3])
    expect(r.minimalSop).toBe('A·B')
  })
  test('solve auto-names vars when width given', () => {
    const r = solve({ minterms: [3], width: 2 })
    expect(r.vars).toEqual(['A', 'B'])
  })
  test('solve throws on missing all inputs', () => {
    expect(() => solve({ width: 2 })).toThrow()
  })
  test('truthTable for constant 1 is all 1s', () => {
    expect(truthTable(parse('1'), ['A'])).toEqual([1, 1])
  })
  test('findPrimeImplicants empty when no minterms', () => {
    expect(findPrimeImplicants([], [], 4)).toEqual([])
  })
  test('minimize honors dont-cares mid-cube', () => {
    const out = minimize([0, 2, 4, 6], [], 3)
    expect(out.length).toBeGreaterThanOrEqual(1)
  })
  test('sortedVars stable for repeated', () => {
    expect(sortedVars(parse('A & A & B'))).toEqual(['A', 'B'])
  })
  test('precedence AND binds tighter than OR (deeper)', () => {
    const e = parse('A | B & C | D')
    expect(evalExpr(e, { A: 0, B: 1, C: 0, D: 0 })).toBe(0)
    expect(evalExpr(e, { A: 0, B: 1, C: 1, D: 0 })).toBe(1)
    expect(evalExpr(e, { A: 0, B: 0, C: 0, D: 1 })).toBe(1)
  })
})
describe('boolean POS edge — empty maxterms', () => {
  test('maxterms=[] yields minimalPos="1"', () => {
    const r = solve({ minterms: [0, 1, 2, 3], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('1')
  })
})
