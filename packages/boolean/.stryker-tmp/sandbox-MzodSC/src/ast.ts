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
type Expr =
  | {
      kind: 'and'
      left: Expr
      right: Expr
    }
  | {
      kind: 'const'
      value: 0 | 1
    }
  | {
      kind: 'not'
      operand: Expr
    }
  | {
      kind: 'or'
      left: Expr
      right: Expr
    }
  | {
      kind: 'var'
      name: string
    }
  | {
      kind: 'xor'
      left: Expr
      right: Expr
    }
const v = stryMutAct_9fa48('0')
  ? () => undefined
  : (stryCov_9fa48('0'),
    (() => {
      const v = (name: string): Expr =>
        stryMutAct_9fa48('1')
          ? {}
          : (stryCov_9fa48('1'),
            {
              kind: stryMutAct_9fa48('2') ? '' : (stryCov_9fa48('2'), 'var'),
              name
            })
      return v
    })())
const c = stryMutAct_9fa48('3')
  ? () => undefined
  : (stryCov_9fa48('3'),
    (() => {
      const c = (value: 0 | 1): Expr =>
        stryMutAct_9fa48('4')
          ? {}
          : (stryCov_9fa48('4'),
            {
              kind: stryMutAct_9fa48('5') ? '' : (stryCov_9fa48('5'), 'const'),
              value
            })
      return c
    })())
const not = stryMutAct_9fa48('6')
  ? () => undefined
  : (stryCov_9fa48('6'),
    (() => {
      const not = (operand: Expr): Expr =>
        stryMutAct_9fa48('7')
          ? {}
          : (stryCov_9fa48('7'),
            {
              kind: stryMutAct_9fa48('8') ? '' : (stryCov_9fa48('8'), 'not'),
              operand
            })
      return not
    })())
const and = stryMutAct_9fa48('9')
  ? () => undefined
  : (stryCov_9fa48('9'),
    (() => {
      const and = (left: Expr, right: Expr): Expr =>
        stryMutAct_9fa48('10')
          ? {}
          : (stryCov_9fa48('10'),
            {
              kind: stryMutAct_9fa48('11') ? '' : (stryCov_9fa48('11'), 'and'),
              left,
              right
            })
      return and
    })())
const or = stryMutAct_9fa48('12')
  ? () => undefined
  : (stryCov_9fa48('12'),
    (() => {
      const or = (left: Expr, right: Expr): Expr =>
        stryMutAct_9fa48('13')
          ? {}
          : (stryCov_9fa48('13'),
            {
              kind: stryMutAct_9fa48('14') ? '' : (stryCov_9fa48('14'), 'or'),
              left,
              right
            })
      return or
    })())
const xor = stryMutAct_9fa48('15')
  ? () => undefined
  : (stryCov_9fa48('15'),
    (() => {
      const xor = (left: Expr, right: Expr): Expr =>
        stryMutAct_9fa48('16')
          ? {}
          : (stryCov_9fa48('16'),
            {
              kind: stryMutAct_9fa48('17') ? '' : (stryCov_9fa48('17'), 'xor'),
              left,
              right
            })
      return xor
    })())
const collectVars = (e: Expr, into = new Set<string>()): Set<string> => {}
const evalExpr = (e: Expr, env: Record<string, 0 | 1>): 0 | 1 => {}
const sortedVars = stryMutAct_9fa48('61')
  ? () => undefined
  : (stryCov_9fa48('61'),
    (() => {
      const sortedVars = (e: Expr): string[] =>
        (stryMutAct_9fa48('62') ? [] : (stryCov_9fa48('62'), [...collectVars(e)])).toSorted(
          stryMutAct_9fa48('63')
            ? () => undefined
            : (stryCov_9fa48('63'),
              (x, y) =>
                (
                  stryMutAct_9fa48('67')
                    ? x >= y
                    : stryMutAct_9fa48('66')
                      ? x <= y
                      : stryMutAct_9fa48('65')
                        ? false
                        : stryMutAct_9fa48('64')
                          ? true
                          : (stryCov_9fa48('64', '65', '66', '67'), x < y)
                )
                  ? stryMutAct_9fa48('68')
                    ? +1
                    : (stryCov_9fa48('68'), -1)
                  : (
                        stryMutAct_9fa48('72')
                          ? x <= y
                          : stryMutAct_9fa48('71')
                            ? x >= y
                            : stryMutAct_9fa48('70')
                              ? false
                              : stryMutAct_9fa48('69')
                                ? true
                                : (stryCov_9fa48('69', '70', '71', '72'), x > y)
                      )
                    ? 1
                    : 0)
        )
      return sortedVars
    })())
const truthTable = (e: Expr, vars: string[] = sortedVars(e)): (0 | 1)[] => {}
const minterms = (e: Expr, vars: string[] = sortedVars(e)): number[] => {}
const maxterms = (e: Expr, vars: string[] = sortedVars(e)): number[] => {}
export { and, c, collectVars, evalExpr, maxterms, minterms, not, or, sortedVars, truthTable, v, xor }
export type { Expr }
