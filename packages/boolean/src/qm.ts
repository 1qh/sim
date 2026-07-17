/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/* eslint-disable @typescript-eslint/max-params, @typescript-eslint/no-use-before-define, @typescript-eslint/no-misused-spread, no-bitwise */
interface Implicant {
  bits: string
  covers: number[]
}
const toBitString = (n: number, width: number): string => n.toString(2).padStart(width, '0')
const countOnes = (bits: string): number => [...bits].filter(b => b === '1').length
const combine = (a: string, b: string): string | undefined => {
  let diff = 0
  let result = ''
  for (let i = 0; i < a.length; i += 1)
    if (a[i] === b[i]) result += a[i]
    else {
      diff += 1
      result += '-'
      if (diff > 1) return
    }
  return diff === 1 ? result : undefined
}
const combinePass = (current: Implicant[]): { next: Implicant[]; used: Set<number> } => {
  const next: Implicant[] = []
  const used = new Set<number>()
  for (let i = 0; i < current.length; i += 1)
    for (let j = i + 1; j < current.length; j += 1) {
      const c = combine(current[i].bits, current[j].bits)
      if (c !== undefined) {
        used.add(i)
        used.add(j)
        const covers = [...new Set([...current[i].covers, ...current[j].covers])].toSorted((a, b) => a - b)
        if (!next.some(n => n.bits === c)) next.push({ bits: c, covers })
      }
    }
  return { next, used }
}
const dedupeByBits = (impls: Implicant[]): Implicant[] => {
  const seen = new Set<string>()
  const unique: Implicant[] = []
  for (const p of impls)
    if (!seen.has(p.bits)) {
      seen.add(p.bits)
      unique.push(p)
    }
  return unique
}
const findPrimeImplicants = (minterms: number[], dontCares: number[], width: number): Implicant[] => {
  const all = [...new Set([...minterms, ...dontCares])].toSorted((a, b) => a - b)
  if (all.length === 0) return []
  let current: Implicant[] = all.map(m => ({ bits: toBitString(m, width), covers: [m] }))
  const primes: Implicant[] = []
  while (current.length > 0) {
    const { next, used } = combinePass(current)
    for (let i = 0; i < current.length; i += 1) if (!used.has(i)) primes.push(current[i])
    current = next
  }
  return dedupeByBits(primes)
}
const findEssentialPrimes = (primes: Implicant[], minterms: number[]): Implicant[] => {
  const essential: Implicant[] = []
  for (const m of minterms) {
    const covers = primes.filter(p => p.covers.includes(m))
    if (covers.length === 1 && !essential.includes(covers[0])) essential.push(covers[0])
  }
  return essential
}
const subsetOf = (candidates: Implicant[], mask: number): Implicant[] => {
  const pick: Implicant[] = []
  for (let b = 0; b < candidates.length; b += 1) if ((mask >> b) & 1) pick.push(candidates[b])
  return pick
}
const coversAll = (pick: Implicant[], remaining: number[]): boolean => {
  const covered = new Set<number>()
  for (const p of pick) for (const m of p.covers) covered.add(m)
  return remaining.every(m => covered.has(m))
}
const petrickSelect = (primes: Implicant[], remaining: number[]): Implicant[] => {
  if (remaining.length === 0) return []
  const candidates = primes.filter(p => p.covers.some(m => remaining.includes(m)))
  if (candidates.length === 0) return []
  let best: Implicant[] = candidates
  let bestLits = Number.POSITIVE_INFINITY
  const allSubsets = 1 << candidates.length
  for (let mask = 1; mask < allSubsets; mask += 1) {
    const pick = subsetOf(candidates, mask)
    if (coversAll(pick, remaining)) {
      const lits = pick.reduce((s, p) => s + countLiterals(p.bits), 0)
      if (pick.length < best.length || (pick.length === best.length && lits < bestLits)) {
        best = pick
        bestLits = lits
      }
    }
  }
  return best
}
const countLiterals = (bits: string): number => [...bits].filter(b => b !== '-').length
const minimize = (minterms: number[], dontCares: number[], width: number): Implicant[] => {
  if (minterms.length === 0) return []
  const primes = findPrimeImplicants(minterms, dontCares, width)
  const essential = findEssentialPrimes(primes, minterms)
  const covered = new Set<number>()
  for (const p of essential) for (const m of p.covers) covered.add(m)
  const remaining = minterms.filter(m => !covered.has(m))
  const extras = petrickSelect(
    primes.filter(p => !essential.includes(p)),
    remaining
  )
  return [...essential, ...extras]
}
const implicantToSop = (imp: Implicant, vars: string[]): string => {
  const lits: string[] = []
  for (let i = 0; i < imp.bits.length; i += 1)
    if (imp.bits[i] !== '-') lits.push(imp.bits[i] === '1' ? vars[i] : `!${vars[i]}`)
  return lits.length === 0 ? '1' : lits.join('·')
}
const sopExpression = (impls: Implicant[], vars: string[]): string => {
  if (impls.length === 0) return '0'
  return impls.map(i => implicantToSop(i, vars)).join(' + ')
}
const posExpression = (maxterms: number[], dontCares: number[], width: number, vars: string[]): string => {
  if (maxterms.length === 0) return '1'
  const dualMinterms = maxterms
  const impls = minimize(dualMinterms, dontCares, width)
  if (impls.length === 0) return '1'
  const clauses = impls.map(imp => {
    const lits: string[] = []
    for (let i = 0; i < imp.bits.length; i += 1)
      if (imp.bits[i] !== '-') lits.push(imp.bits[i] === '0' ? vars[i] : `!${vars[i]}`)
    return lits.length === 0 ? '0' : `(${lits.join(' + ')})`
  })
  return clauses.join('·')
}
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
