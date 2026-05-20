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
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, unicorn/filename-case */
'use client'
import dynamic from 'next/dynamic'

const ToroidalKmap = dynamic(async () => import('./toroidal-kmap'), {
  loading: () => <div className='h-[420px] w-full animate-pulse rounded-lg border bg-muted/30' />,
  ssr: false
})
const KmapIsland = ({ vars, truthTable }: { truthTable: readonly (0 | 1 | 'X')[]; vars: number }) => (
  <ToroidalKmap truthTable={truthTable} vars={vars} />
)
export default KmapIsland
