import type { Expr } from './ast'
import type { Implicant } from './qm'
import { evalExpr, maxterms, minterms, sortedVars, truthTable } from './ast'
import { espressoPos } from './espresso'
import { parse } from './parser'
import { findEssentialPrimes, findPrimeImplicants, minimize, posExpression, sopExpression } from './qm'

interface SolveInput {
  dontCares?: number[]
  expression?: string
  maxterms?: number[]
  minterms?: number[]
  vars?: string[]
  width?: number
}
interface SolveResult {
  dontCares: number[]
  essentialPrimeImplicants: Implicant[]
  expr: Expr | undefined
  maxterms: number[]
  minimalPos: string
  minimalSop: string
  minimalSopImplicants: Implicant[]
  minterms: number[]
  primeImplicants: Implicant[]
  truthTable: (0 | 1)[]
  vars: string[]
  width: number
}
const complementTerms = (present: number[], dontCares: number[] | undefined, width: number): number[] => {
  const out: number[] = []
  const presentSet = new Set(present)
  const dcSet = new Set(dontCares)
  const rows = 2 ** width
  for (let i = 0; i < rows; i += 1) if (!(presentSet.has(i) || dcSet.has(i))) out.push(i)
  return out
}
const buildTruthTable = ({
  dontCares,
  expr,
  mins,
  vars,
  width
}: {
  dontCares: number[]
  expr: Expr | undefined
  mins: number[]
  vars: string[]
  width: number
}): (0 | 1)[] => {
  if (expr !== undefined) return truthTable(expr, vars)
  const tt: (0 | 1)[] = []
  const rows = 2 ** width
  const minSet = new Set(mins)
  const dcSet = new Set(dontCares)
  for (let i = 0; i < rows; i += 1) tt.push(minSet.has(i) || dcSet.has(i) ? 1 : 0)
  return tt
}
const solve = (input: SolveInput): SolveResult => {
  let expr: Expr | undefined
  let vars: string[] | undefined = input.vars
  let mins: number[]
  let maxs: number[]
  let width: number
  if (input.expression === undefined) {
    width = input.width ?? vars?.length ?? 0
    if (width === 0) throw new Error('solve: vars or width required when expression missing')
    vars ??= Array.from({ length: width }, (_, i) => String.fromCodePoint(0x41 + i))
    if (input.minterms !== undefined) {
      mins = input.minterms
      maxs = complementTerms(mins, input.dontCares, width)
    } else if (input.maxterms === undefined) throw new Error('solve: expression / minterms / maxterms required')
    else {
      maxs = input.maxterms
      mins = complementTerms(maxs, input.dontCares, width)
    }
  } else {
    expr = parse(input.expression)
    vars ??= sortedVars(expr)
    width = vars.length
    const tt = truthTable(expr, vars)
    mins = []
    maxs = []
    for (let i = 0; i < tt.length; i += 1) (tt[i] === 1 ? mins : maxs).push(i)
  }
  const dontCares = input.dontCares ?? []
  const primes = findPrimeImplicants(mins, dontCares, width)
  const essentialPrimeImplicants = findEssentialPrimes(primes, mins)
  const minimalSopImplicants = minimize(mins, dontCares, width)
  const minimalSop = sopExpression(minimalSopImplicants, vars)
  const minimalPos = width <= 4 ? posExpression(maxs, dontCares, width, vars) : espressoPos(maxs, dontCares, width, vars)
  const tt = buildTruthTable({ dontCares, expr, mins, vars, width })
  return {
    dontCares,
    essentialPrimeImplicants,
    expr,
    maxterms: maxs,
    minimalPos,
    minimalSop,
    minimalSopImplicants,
    minterms: mins,
    primeImplicants: primes,
    truthTable: tt,
    vars,
    width
  }
}
export {
  evalExpr,
  findEssentialPrimes,
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
}
export type { Expr, Implicant, SolveInput, SolveResult }
