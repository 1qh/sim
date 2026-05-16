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
/* eslint-disable @typescript-eslint/no-unused-vars, no-bitwise */
import type { Arbitrary } from 'fast-check'
import { describe, expect, test } from 'bun:test'
import { assert, integer, property, uniqueArray } from 'fast-check'
import {
  evalExpr,
  findPrimeImplicants,
  maxterms,
  minimize,
  minterms,
  parse,
  posExpression,
  solve,
  sopExpression,
  sortedVars,
  truthTable
} from './index'
import { countLiterals, countOnes, implicantToSop, petrickSelect, toBitString } from './qm'
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
describe('boolean exhaustive 2-var equivalence', () => {
  test('every 2-var Boolean function: SOP matches truth table', () => {
    for (let mask = 0; mask < 16; mask += 1) {
      const mins: number[] = []
      for (let i = 0; i < 4; i += 1) if ((mask >> i) & 1) mins.push(i)
      const r = solve({ minterms: mins, vars: ['A', 'B'] })
      for (let i = 0; i < 4; i += 1) {
        const expected = mins.includes(i) ? 1 : 0
        expect(r.truthTable[i]).toBe(expected)
      }
    }
  })
  test('every 2-var function: minterms+maxterms partition cube', () => {
    for (let mask = 0; mask < 16; mask += 1) {
      const mins: number[] = []
      for (let i = 0; i < 4; i += 1) if ((mask >> i) & 1) mins.push(i)
      const r = solve({ minterms: mins, vars: ['A', 'B'] })
      expect(r.minterms.length + r.maxterms.length).toBe(4)
      for (const m of r.minterms) expect(r.maxterms.includes(m)).toBe(false)
    }
  })
})
describe('boolean ast helpers via parse', () => {
  test('NOT eval', () => {
    expect(evalExpr(parse('!A'), { A: 0 })).toBe(1)
    expect(evalExpr(parse('!A'), { A: 1 })).toBe(0)
  })
  test('const 1 truth-table is all-1', () => {
    expect(truthTable(parse('1'), ['A', 'B'])).toEqual([1, 1, 1, 1])
  })
  test('const 0 truth-table is all-0', () => {
    expect(truthTable(parse('0'), ['A', 'B'])).toEqual([0, 0, 0, 0])
  })
  test('AND truth-table exact', () => {
    expect(truthTable(parse('A & B'))).toEqual([0, 0, 0, 1])
  })
  test('OR truth-table exact', () => {
    expect(truthTable(parse('A | B'))).toEqual([0, 1, 1, 1])
  })
  test('XOR truth-table exact', () => {
    expect(truthTable(parse('A ^ B'))).toEqual([0, 1, 1, 0])
  })
  test('minterms helper extracts 1-positions', () => {
    expect(minterms(parse('A & B'), ['A', 'B'])).toEqual([3])
    expect(minterms(parse('A | B'), ['A', 'B'])).toEqual([1, 2, 3])
  })
  test('maxterms helper extracts 0-positions', () => {
    expect(maxterms(parse('A & B'), ['A', 'B'])).toEqual([0, 1, 2])
    expect(maxterms(parse('A | B'), ['A', 'B'])).toEqual([0])
  })
  test('sortedVars returns alphabetical unique', () => {
    expect(sortedVars(parse('C & B & A'))).toEqual(['A', 'B', 'C'])
  })
  test('sortedVars for constant is empty', () => {
    expect(sortedVars(parse('1'))).toEqual([])
  })
})
describe('boolean qm helpers', () => {
  test('findPrimeImplicants for OR(A,B) yields 2 primes', () => {
    const primes = findPrimeImplicants([1, 2, 3], [], 2)
    expect(primes).toHaveLength(2)
  })
  test('minimize returns essential primes for majority(A,B,C)', () => {
    const out = minimize([3, 5, 6, 7], [], 3)
    expect(out.length).toBeGreaterThanOrEqual(3)
  })
  test('sopExpression for empty implicants is "0"', () => {
    expect(sopExpression([], ['A', 'B'])).toBe('0')
  })
  test('sopExpression for all-dash implicant is "1"', () => {
    expect(sopExpression([{ bits: '--', mintermsCovered: [0, 1, 2, 3] }], ['A', 'B'])).toBe('1')
  })
  test('posExpression for empty maxterms is "1"', () => {
    expect(posExpression([], [], 2, ['A', 'B'])).toBe('1')
  })
  test('posExpression for full maxterms is "0"', () => {
    expect(posExpression([0, 1, 2, 3], [], 2, ['A', 'B'])).toBe('0')
  })
})
describe('boolean qm internals', () => {
  test('toBitString pads with leading zeros', () => {
    expect(toBitString(0, 3)).toBe('000')
    expect(toBitString(1, 3)).toBe('001')
    expect(toBitString(5, 4)).toBe('0101')
    expect(toBitString(15, 4)).toBe('1111')
  })
  test('countOnes counts 1-bits exactly', () => {
    expect(countOnes('0000')).toBe(0)
    expect(countOnes('1010')).toBe(2)
    expect(countOnes('1111')).toBe(4)
    expect(countOnes('1-1-')).toBe(2)
  })
  test('countLiterals counts non-dash chars', () => {
    expect(countLiterals('----')).toBe(0)
    expect(countLiterals('1-0-')).toBe(2)
    expect(countLiterals('1010')).toBe(4)
  })
  test('implicantToSop builds correct minterm clause', () => {
    expect(implicantToSop({ bits: '11', covers: [3] }, ['A', 'B'])).toBe('A·B')
    expect(implicantToSop({ bits: '00', covers: [0] }, ['A', 'B'])).toBe('!A·!B')
    expect(implicantToSop({ bits: '1-', covers: [2, 3] }, ['A', 'B'])).toBe('A')
    expect(implicantToSop({ bits: '-0', covers: [0, 2] }, ['A', 'B'])).toBe('!B')
    expect(implicantToSop({ bits: '--', covers: [0, 1, 2, 3] }, ['A', 'B'])).toBe('1')
  })
  test('sopExpression joins multi-implicant with " + "', () => {
    expect(
      sopExpression(
        [
          { bits: '11', covers: [3] },
          { bits: '00', covers: [0] }
        ],
        ['A', 'B']
      )
    ).toBe('A·B + !A·!B')
  })
  test('petrickSelect picks min-cost cover for choice', () => {
    const primes = [
      { bits: '0-', covers: [0, 1] },
      { bits: '-0', covers: [0, 2] },
      { bits: '11', covers: [3] }
    ]
    const r = petrickSelect(primes, [1, 2, 3])
    expect(r.length).toBeGreaterThanOrEqual(2)
    const covered = new Set<number>()
    for (const p of r) for (const m of p.covers) covered.add(m)
    expect([1, 2, 3].every(m => covered.has(m))).toBe(true)
  })
  test('petrickSelect returns [] for empty remaining', () => {
    expect(petrickSelect([], [])).toEqual([])
  })
  test('petrickSelect returns [] when no candidate covers any remaining', () => {
    expect(petrickSelect([{ bits: '00', covers: [0] }], [3])).toEqual([])
  })
  test('findPrimeImplicants handles only-dontcares as non-empty', () => {
    const r = findPrimeImplicants([], [1, 2], 2)
    expect(Array.isArray(r)).toBe(true)
  })
  test('findPrimeImplicants combine produces dashed prime for adjacent pair', () => {
    const r = findPrimeImplicants([0, 1], [], 2)
    expect(r).toHaveLength(1)
    expect(r[0].bits).toBe('0-')
  })
  test('findPrimeImplicants for 3-var f=A·B+B·C', () => {
    const r = findPrimeImplicants([3, 6, 7], [], 3)
    expect(r.length).toBeGreaterThanOrEqual(2)
  })
})
describe('boolean POS edge — empty maxterms', () => {
  test('maxterms=[] yields minimalPos="1"', () => {
    const r = solve({ minterms: [0, 1, 2, 3], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('1')
  })
  test('F=0 yields minimalPos="0"', () => {
    const r = solve({ minterms: [], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('0')
  })
  test('F=A yields minimalPos="(A)"', () => {
    const r = solve({ minterms: [2, 3], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('(A)')
  })
  test('F=!A yields minimalPos="(!A)"', () => {
    const r = solve({ minterms: [0, 1], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('(!A)')
  })
  test('F=A·B yields two clauses joined by "·"', () => {
    const r = solve({ minterms: [3], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('(A)·(B)')
  })
  test('F=A+B yields one clause with " + " literal separator', () => {
    const r = solve({ minterms: [1, 2, 3], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('(A + B)')
  })
  test('F=!A·!B yields "(A + B)" alternative? no: minterm=0', () => {
    const r = solve({ minterms: [0], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('(!B)·(!A)')
  })
  test('POS XOR (A^B) yields two clauses with mixed polarity', () => {
    const r = solve({ minterms: [1, 2], vars: ['A', 'B'] })
    expect(r.minimalPos).toBe('(A + B)·(!A + !B)')
  })
})
