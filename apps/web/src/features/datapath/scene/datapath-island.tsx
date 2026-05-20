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
'use client'
import dynamic from 'next/dynamic'
import type { ControlSignals } from '@/features/mips/types'

const DatapathScene = dynamic(async () => import('./datapath-scene'), {
  loading: () => <div className='h-[420px] w-full animate-pulse rounded-lg border bg-muted/30' />,
  ssr: false
})
const DatapathIsland = ({
  name,
  control,
  critical,
  criticalDelayPs
}: {
  control: ControlSignals
  critical: readonly string[]
  criticalDelayPs: number
  name: string
}) => <DatapathScene control={control} critical={critical} criticalDelayPs={criticalDelayPs} name={name} />
export default DatapathIsland
