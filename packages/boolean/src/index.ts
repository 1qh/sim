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
/* eslint-disable complexity, @typescript-eslint/naming-convention */
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
      maxs = []
      const rows = 2 ** width
      const minSet = new Set(mins)
      const dcSet = new Set(input.dontCares)
      for (let i = 0; i < rows; i += 1) if (!(minSet.has(i) || dcSet.has(i))) maxs.push(i)
    } else if (input.maxterms === undefined) throw new Error('solve: expression / minterms / maxterms required')
    else {
      maxs = input.maxterms
      mins = []
      const rows = 2 ** width
      const maxSet = new Set(maxs)
      const dcSet = new Set(input.dontCares)
      for (let i = 0; i < rows; i += 1) if (!(maxSet.has(i) || dcSet.has(i))) mins.push(i)
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
  const tt: (0 | 1)[] = []
  if (expr === undefined) {
    const rows = 2 ** width
    const minSet = new Set(mins)
    const dcSet = new Set(dontCares)
    for (let i = 0; i < rows; i += 1) tt.push(minSet.has(i) ? 1 : dcSet.has(i) ? 1 : 0)
  } else {
    const computed = truthTable(expr, vars)
    for (const v_ of computed) tt.push(v_)
  }
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
