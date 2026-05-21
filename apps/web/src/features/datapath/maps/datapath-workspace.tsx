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
import { ChevronLeft, Code2, Route, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals } from '@/features/mips/types'
import AsmEditor from '@/features/datapath/asm-editor'
import { activePaths, componentsForPaths, STEPS } from '@/features/datapath/generated/stepTraces'
import DatapathIsland from '@/features/datapath/scene/datapath-island'

const PANEL = 'rounded-xl border bg-background/80 shadow-lg backdrop-blur-md'
const DatapathWorkspace = ({
  name,
  control,
  critical,
  criticalDelayPs,
  asmInitial
}: {
  asmInitial: string
  control: ControlSignals
  critical: readonly string[]
  criticalDelayPs: number
  name: string
}): React.JSX.Element => {
  const [step, setStep] = useState<Step>('EX')
  const [showCritical, setShowCritical] = useState(false)
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const [editorOpen, setEditorOpen] = useState(false)
  const activeP = useMemo(() => new Set(activePaths(control, step)), [control, step])
  const activeC = useMemo(() => new Set(componentsForPaths([...activeP])), [activeP])
  return (
    <div className='fixed inset-0'>
      <DatapathIsland
        control={control}
        critical={critical}
        onSelect={setSelected}
        selected={selected}
        showCritical={showCritical}
        step={step}
      />
      <div className={cn('absolute top-4 left-16 px-3 py-1.5 font-mono text-sm', PANEL)}>MIPS · {name}</div>
      {editorOpen ? (
        <div className={cn('absolute top-16 left-4 flex w-80 flex-col gap-2 p-3', PANEL)}>
          <div className='flex items-center justify-between'>
            <span className='font-mono text-xs text-muted-foreground'>assembly</span>
            <button onClick={() => setEditorOpen(false)} type='button'>
              <ChevronLeft className='size-4' />
            </button>
          </div>
          <AsmEditor initial={asmInitial} />
        </div>
      ) : (
        <button
          className={cn('absolute top-16 left-4 flex items-center gap-2 px-3 py-2 text-sm', PANEL)}
          onClick={() => setEditorOpen(true)}
          type='button'>
          <Code2 className='size-4' /> Editor
        </button>
      )}
      <div className={cn('absolute top-4 right-4 flex max-w-72 flex-col gap-1 p-3 font-mono text-xs', PANEL)}>
        <div className='text-muted-foreground'>
          step {step} · {activeC.size} components / {activeP.size} paths active
        </div>
        <div>
          RegDst={control.RegDst} ALUSrc={control.ALUSrc} MemToReg={control.MemToReg} RegWrite={control.RegWrite}
        </div>
        <div>
          MemRead={control.MemRead} MemWrite={control.MemWrite} Branch={control.Branch} ALUOp={control.ALUOp}
        </div>
        {showCritical ? (
          <div className='text-[#f97316]'>
            critical: {critical.length} components · {criticalDelayPs} ps
          </div>
        ) : undefined}
      </div>
      {selected === undefined ? undefined : (
        <div className={cn('absolute top-1/2 right-4 w-64 -translate-y-1/2 p-4', PANEL)}>
          <div className='flex items-center justify-between'>
            <span className='font-mono font-bold text-[#a855f7]'>{selected}</span>
            <button onClick={() => setSelected(undefined)} type='button'>
              <X className='size-4' />
            </button>
          </div>
          <ul className='mt-2 space-y-1 font-mono text-xs text-muted-foreground'>
            <li>active this step: {activeC.has(selected) ? 'yes' : 'no'}</li>
            <li>on critical path: {critical.includes(selected) ? 'yes' : 'no'}</li>
          </ul>
        </div>
      )}
      <div
        aria-label='datapath step'
        className={cn('-translate-x-1/2 absolute bottom-6 left-1/2 flex items-center gap-1 p-1.5', PANEL)}
        role='tablist'>
        {STEPS.map(s => (
          <button
            aria-selected={s === step}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm transition',
              s === step ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
            )}
            key={s}
            onClick={() => setStep(s)}
            role='tab'
            type='button'>
            {s}
          </button>
        ))}
        <button
          aria-pressed={showCritical}
          className={cn(
            'ml-1 flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition',
            showCritical ? 'bg-[#f97316] text-white' : 'hover:bg-muted'
          )}
          onClick={() => setShowCritical(v => !v)}
          type='button'>
          <Route className='size-4' /> critical
        </button>
      </div>
    </div>
  )
}
export default DatapathWorkspace
