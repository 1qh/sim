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
import type { ControlSignals } from '@/features/mips/types'
import DatapathIsland from '@/features/datapath/scene/datapath-island'

interface Pane {
  control: ControlSignals
  critical: readonly string[]
  criticalDelayPs: number
  name: string
}
const ComparePane = ({ pane, side }: { pane: Pane; side: 'left' | 'right' }): React.JSX.Element => (
  <section aria-label={`compare ${side}: ${pane.name}`} className='flex min-w-0 flex-1 flex-col gap-2'>
    <h2 className='font-mono text-sm text-muted-foreground'>
      {side} · {pane.name}
    </h2>
    <DatapathIsland
      control={pane.control}
      critical={pane.critical}
      criticalDelayPs={pane.criticalDelayPs}
      name={pane.name}
    />
  </section>
)
const CompareIsland = ({
  left,
  right,
  controlDiff
}: {
  controlDiff: readonly string[]
  left: Pane
  right: Pane
}): React.JSX.Element => (
  <div className='flex flex-col gap-6'>
    <div className='flex flex-col gap-6 lg:flex-row'>
      <ComparePane pane={left} side='left' />
      <ComparePane pane={right} side='right' />
    </div>
    <section aria-label='control-signal diff' className='rounded-lg border p-4 font-mono text-sm'>
      <h2 className='mb-2 font-bold'>
        {left.name} vs {right.name}
      </h2>
      {controlDiff.length === 0 ? (
        <p className='text-muted-foreground'>identical control signals</p>
      ) : (
        <ul className='[&>li]:py-0.5'>
          {controlDiff.map(d => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      )}
    </section>
  </div>
)
export default CompareIsland
export type { Pane }
