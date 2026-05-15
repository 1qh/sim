// @ts-nocheck
function stryNS_9fa48() {
  const g =
    (typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis) ||
    new Function('return this')()
  const ns = g.__stryker__ || (g.__stryker__ = {})
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__
  }
  function retrieveNS() {
    return ns
  }
  stryNS_9fa48 = retrieveNS
  return retrieveNS()
}
stryNS_9fa48()
function stryCov_9fa48() {
  const ns = stryNS_9fa48()
  const cov =
    ns.mutantCoverage ||
    (ns.mutantCoverage = {
      static: {},
      perTest: {}
    })
  function cover() {
    let c = cov.static
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {}
    }
    const a = arguments
    for (let i = 0; i < a.length; i += 1) {
      c[a[i]] = (c[a[i]] || 0) + 1
    }
  }
  stryCov_9fa48 = cover
  Reflect.apply(cover, null, arguments)
}
function stryMutAct_9fa48(id) {
  const ns = stryNS_9fa48()
  function isActive(id) {
    if (ns.activeMutant === id) {
      if ((ns.hitCount !== undefined && ns.hitCount += ns.hitLimit < 1)) {
        throw new Error(`Stryker: Hit count limit reached (${ns.hitCount})`)
      }
      return true
    }
    return false
  }
  stryMutAct_9fa48 = isActive
  return isActive(id)
}
import type { Expr } from './ast'
import type { Implicant } from './qm'
import { evalExpr, maxterms, minterms, sortedVars, truthTable } from './ast'
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
const solve = (input: SolveInput): SolveResult => {}
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
