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
interface Implicant {
  bits: string
  covers: number[]
}
const toBitString = stryMutAct_9fa48('173')
  ? () => undefined
  : (stryCov_9fa48('173'),
    (() => {
      const toBitString = (n: number, width: number): string =>
        n.toString(2).padStart(width, stryMutAct_9fa48('174') ? '' : (stryCov_9fa48('174'), '0'))
      return toBitString
    })())
const countOnes = stryMutAct_9fa48('175')
  ? () => undefined
  : (stryCov_9fa48('175'),
    (() => {
      const countOnes = (bits: string): number =>
        stryMutAct_9fa48('176')
          ? [...bits].length
          : (stryCov_9fa48('176'),
            (stryMutAct_9fa48('177') ? [] : (stryCov_9fa48('177'), [...bits])).filter(
              stryMutAct_9fa48('178')
                ? () => undefined
                : (stryCov_9fa48('178'),
                  b =>
                    stryMutAct_9fa48('181')
                      ? b !== '1'
                      : stryMutAct_9fa48('180')
                        ? false
                        : stryMutAct_9fa48('179')
                          ? true
                          : (stryCov_9fa48('179', '180', '181'),
                            b === (stryMutAct_9fa48('182') ? '' : (stryCov_9fa48('182'), '1'))))
            ).length)
      return countOnes
    })())
const combine = (a: string, b: string): string | undefined => {}
const findPrimeImplicants = (minterms: number[], dontCares: number[], width: number): Implicant[] => {}
const findEssentialPrimes = (primes: Implicant[], minterms: number[]): Implicant[] => {}
const petrickSelect = (primes: Implicant[], remaining: number[]): Implicant[] => {}
const countLiterals = stryMutAct_9fa48('316')
  ? () => undefined
  : (stryCov_9fa48('316'),
    (() => {
      const countLiterals = (bits: string): number =>
        stryMutAct_9fa48('317')
          ? [...bits].length
          : (stryCov_9fa48('317'),
            (stryMutAct_9fa48('318') ? [] : (stryCov_9fa48('318'), [...bits])).filter(
              stryMutAct_9fa48('319')
                ? () => undefined
                : (stryCov_9fa48('319'),
                  b =>
                    stryMutAct_9fa48('322')
                      ? b === '-'
                      : stryMutAct_9fa48('321')
                        ? false
                        : stryMutAct_9fa48('320')
                          ? true
                          : (stryCov_9fa48('320', '321', '322'),
                            b !== (stryMutAct_9fa48('323') ? '' : (stryCov_9fa48('323'), '-'))))
            ).length)
      return countLiterals
    })())
const minimize = (minterms: number[], dontCares: number[], width: number): Implicant[] => {}
const implicantToSop = (imp: Implicant, vars: string[]): string => {}
const sopExpression = (impls: Implicant[], vars: string[]): string => {}
const posExpression = (maxterms: number[], dontCares: number[], width: number, vars: string[]): string => {}
export {
  countLiterals,
  countOnes,
  findEssentialPrimes,
  findPrimeImplicants,
  implicantToSop,
  minimize,
  petrickSelect,
  posExpression,
  sopExpression,
  toBitString
}
export type { Implicant }
