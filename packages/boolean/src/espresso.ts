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
/* eslint-disable no-bitwise, @typescript-eslint/max-params */
import { espresso } from 'espresso-iisojs'

const encodeMaxtermClause = (m: number, width: number): number[] => {
  const clause: number[] = []
  for (let i = 0; i < width; i += 1) {
    const bit = (m >> (width - 1 - i)) & 1
    clause.push((i << 1) | (bit === 0 ? 1 : 0))
  }
  return clause.toSorted((a, b) => a - b)
}
const decodePosClause = (clause: number[], vars: string[]): string => {
  const lits = clause.map(lit => {
    const v = vars[lit >> 1]
    return (lit & 1) === 1 ? v : `!${v}`
  })
  return lits.length === 0 ? '0' : `(${lits.join(' + ')})`
}
const espressoPos = (maxterms: number[], dontCares: number[], width: number, vars: string[]): string => {
  if (maxterms.length === 0) return '1'
  const dnf = maxterms.map(m => encodeMaxtermClause(m, width))
  const dcs = dontCares.map(m => encodeMaxtermClause(m, width))
  const minimized = espresso(dnf, dcs)
  if (minimized.length === 0) return '1'
  const clauses = minimized.map(c => decodePosClause(c, vars))
  return clauses.join('·')
}
export { espressoPos }
