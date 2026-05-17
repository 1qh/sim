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
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, react-perf/jsx-no-new-array-as-prop */
/* eslint-disable @typescript-eslint/require-await */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { kmap } from '@/features/kmap'
import KmapGrid from '@/features/kmap/scene/kmap-grid'
import KmapIsland from '@/features/kmap/scene/kmap-island'
const buildTruthTable = (vars: number, minterms: readonly number[], dontCares: readonly number[]): (0 | 1 | 'X')[] => {
  const mins = new Set(minterms)
  const dcs = new Set(dontCares)
  return Array.from({ length: 2 ** vars }, (_, i) => (dcs.has(i) ? 'X' : mins.has(i) ? 1 : 0))
}
const CASES: Record<string, { dontCares?: number[]; minterms?: number[]; vars: string[] }> = {
  v2: { minterms: [0, 1, 2], vars: ['A', 'B'] },
  v3: { minterms: [1, 3, 5, 7], vars: ['A', 'B', 'C'] },
  v4: { minterms: [0, 1, 5, 7, 8, 9, 13], vars: ['A', 'B', 'C', 'D'] },
  'v4-pos': { minterms: [3, 5], vars: ['A', 'B', 'C', 'D'] },
  v5: { minterms: [0, 1, 5, 7], vars: ['A', 'B', 'C', 'D', 'E'] },
  'v5-wrap': { minterms: [0, 16], vars: ['A', 'B', 'C', 'D', 'E'] },
  v6: { minterms: [0, 1], vars: ['A', 'B', 'C', 'D', 'E', 'F'] },
  'v6-wrap': { minterms: [0, 32], vars: ['A', 'B', 'C', 'D', 'E', 'F'] }
}
const generateStaticParams = async () => Object.keys(CASES).map(c => ({ case: c }))
const Page = async ({ params }: { params: Promise<{ case: string }> }) => {
  const { case: caseName } = await params
  const config = CASES[caseName]
  if (!config) notFound()
  const result = kmap(config)
  return (
    <main aria-label={`kmap-${caseName}`} className='flex min-h-screen flex-col gap-8 p-8'>
      <h1 className='text-3xl font-bold'>K-map · {caseName}</h1>
      <section aria-label='kmap-result' className='space-y-1 rounded-lg border p-4 font-mono text-sm'>
        <div>geometry: {result.geometry}</div>
        <div>vars: {result.vars.join(', ')}</div>
        <div>SOP: {result.minimalSop}</div>
        <div>POS: {result.minimalPos}</div>
        <div>prime implicants: {result.primeImplicants.length}</div>
        <div>essential PIs: {result.essentialPrimeImplicants.length}</div>
      </section>
      {config.vars.length >= 5 ? (
        <KmapIsland
          truthTable={buildTruthTable(config.vars.length, config.minterms ?? [], config.dontCares ?? [])}
          vars={config.vars.length}
        />
      ) : (
        <KmapGrid minterms={config.minterms ?? []} vars={config.vars.length} />
      )}
      <Link className='text-sm underline' href='/kmap'>
        back
      </Link>
    </main>
  )
}
export { generateStaticParams }
export default Page
