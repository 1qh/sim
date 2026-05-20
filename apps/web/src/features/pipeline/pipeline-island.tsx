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
import { cn } from '@a/ui'
import { useMemo, useState } from 'react'
import type { Instruction } from '@/features/mips/types'
import { analyzePipeline } from '@/features/pipeline'
import StageMatrix from './stage-matrix'

const PipelineIsland = ({ instructions }: { instructions: Instruction[] }): React.JSX.Element => {
  const [forwarding, setForwarding] = useState(true)
  const [stall, setStall] = useState(true)
  const [cycle, setCycle] = useState(1)
  const report = useMemo(
    () => analyzePipeline(instructions, { enableForwarding: forwarding, stallInsertion: stall }),
    [instructions, forwarding, stall]
  )
  const maxCycle = report.cycleCount
  return (
    <section aria-label='pipeline interactive' className='flex flex-col gap-4'>
      <div className='flex flex-wrap items-center gap-3 font-mono text-sm'>
        <button
          aria-pressed={forwarding}
          className={cn('rounded border px-3 py-1', forwarding && 'bg-primary')}
          onClick={() => setForwarding(v => !v)}
          type='button'>
          forwarding {forwarding ? 'on' : 'off'}
        </button>
        <button
          aria-pressed={stall}
          className={cn('rounded border px-3 py-1', stall && 'bg-primary')}
          onClick={() => setStall(v => !v)}
          type='button'>
          stall-insertion {stall ? 'on' : 'off'}
        </button>
        <label className='flex items-center gap-2'>
          scrub cycle {cycle}/{maxCycle}
          <input
            aria-label='cycle scrub'
            className='w-48'
            max={maxCycle}
            min={1}
            onChange={e => setCycle(Number(e.target.value))}
            type='range'
            value={Math.min(cycle, maxCycle)}
          />
        </label>
      </div>
      <StageMatrix report={report} />
    </section>
  )
}
export default PipelineIsland
