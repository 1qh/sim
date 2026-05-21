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
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, complexity */
/* eslint-disable complexity */
'use client'
import { cn } from '@a/ui'
import { ChevronLeft, ChevronRight, Code2, Pause, Play, Route, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals, Instruction } from '@/features/mips/types'
import { criticalComponents, criticalPath } from '@/features/critical-path'
import DatapathA11yProxies from '@/features/datapath/a11y/proxies'
import AsmEditor from '@/features/datapath/asm-editor'
import { createProgram, current, stepForward } from '@/features/datapath/execution'
import { activePaths, componentsForPaths, STEPS } from '@/features/datapath/generated/stepTraces'
import { COMPONENTS } from '@/features/datapath/generated/topology'
import DatapathIsland from '@/features/datapath/scene/datapath-island'
import { datapathValues } from '@/features/datapath/values'
import { controlFor, encodeInstruction } from '@/features/mips'

const PANEL = 'rounded-xl border bg-background/80 shadow-lg backdrop-blur-md'
const ROLE = new Map(COMPONENTS.map(c => [c.id, c.role]))
const HINT_KEY = 'sim-datapath-hint-seen'
const STEP_SET = new Set<string>(STEPS)
const readParam = (key: string): string | undefined => {
  if (typeof window === 'undefined') return
  return new URLSearchParams(window.location.search).get(key) ?? undefined
}
const writeParams = (step: string, selected: string | undefined): void => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  params.set('step', step)
  if (selected === undefined) params.delete('sel')
  else params.set('sel', selected)
  window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
}
const initialStep = (): Step => {
  const s = readParam('step')
  return s !== undefined && STEP_SET.has(s) ? (s as Step) : 'EX'
}
const DatapathWorkspace = ({
  name,
  control,
  critical,
  criticalDelayPs,
  asmInitial,
  values
}: {
  asmInitial: string
  control: ControlSignals
  critical: readonly string[]
  criticalDelayPs: number
  name: string
  values: Record<string, string>
}): React.JSX.Element => {
  const [step, setStep] = useState<Step>(initialStep)
  const [showCritical, setShowCritical] = useState(false)
  const [selected, setSelected] = useState<string | undefined>(() => readParam('sel'))
  const [editorOpen, setEditorOpen] = useState(false)
  const [hint, setHint] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [liveProgram, setLiveProgram] = useState<readonly Instruction[]>([])
  const [insIndex, setInsIndex] = useState(0)
  useEffect(() => {
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    if (localStorage.getItem(HINT_KEY) === null) setHint(true)
  }, [])
  useEffect(() => {
    writeParams(step, selected)
  }, [step, selected])
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setStep(s => STEPS[(STEPS.indexOf(s) + 1) % STEPS.length] ?? 'IF'), 1100)
    return () => clearInterval(id)
  }, [playing])
  const live = useMemo(() => {
    if (liveProgram.length === 0) return
    const idx = Math.min(insIndex, liveProgram.length - 1)
    const ins = liveProgram[idx]
    if (ins === undefined) return
    const words = liveProgram.map(encodeInstruction)
    let prog = createProgram(words)
    for (let i = 0; i < idx; i += 1) prog = stepForward(prog)
    const before = current(prog)
    const after = current(stepForward(prog))
    return {
      control: controlFor(ins),
      count: liveProgram.length,
      critical: criticalComponents(ins, 'timing'),
      criticalDelayPs: criticalPath(ins, 'timing').delayPs,
      idx,
      values: datapathValues(before, after, ins)
    }
  }, [liveProgram, insIndex])
  const aControl = live?.control ?? control
  const aCritical = live?.critical ?? critical
  const aDelay = live?.criticalDelayPs ?? criticalDelayPs
  const aValues = live?.values ?? values
  const valueEntries = useMemo(() => Object.entries(aValues), [aValues])
  const dismissHint = (): void => {
    setHint(false)
    localStorage.setItem(HINT_KEY, '1')
  }
  const activeP = useMemo(() => new Set(activePaths(aControl, step)), [aControl, step])
  const activeC = useMemo(() => new Set(componentsForPaths([...activeP])), [activeP])
  const activeList = useMemo(() => [...activeC], [activeC])
  return (
    <div className='fixed inset-0' onPointerDown={hint ? dismissHint : undefined}>
      <DatapathIsland
        control={aControl}
        critical={aCritical}
        onSelect={setSelected}
        selected={selected}
        showCritical={showCritical}
        step={step}
      />
      <h1 className={cn('absolute top-4 left-16 px-3 py-1.5 font-mono text-sm', PANEL)}>MIPS · {name}</h1>
      {editorOpen ? (
        <div
          className={cn(
            'absolute top-16 left-4 flex w-80 flex-col gap-2 p-3 max-sm:inset-x-2 max-sm:top-auto max-sm:bottom-24 max-sm:w-auto',
            PANEL
          )}>
          <div className='flex items-center justify-between'>
            <span className='font-mono text-xs text-muted-foreground'>assembly</span>
            <button onClick={() => setEditorOpen(false)} type='button'>
              <ChevronLeft className='size-4' />
            </button>
          </div>
          <AsmEditor
            initial={asmInitial}
            onAssembled={ins => {
              setLiveProgram(ins)
              setInsIndex(0)
            }}
          />
        </div>
      ) : (
        <button
          className={cn('absolute top-16 left-4 flex items-center gap-2 px-3 py-2 text-sm', PANEL)}
          onClick={() => setEditorOpen(true)}
          type='button'>
          <Code2 className='size-4' /> Editor
        </button>
      )}
      <div
        className={cn('absolute top-4 right-4 flex max-w-72 flex-col gap-1 p-3 font-mono text-xs max-sm:hidden', PANEL)}>
        <div className='text-muted-foreground'>
          step {step} · {activeC.size} components / {activeP.size} paths active
        </div>
        <div>
          RegDst={aControl.RegDst} ALUSrc={aControl.ALUSrc} MemToReg={aControl.MemToReg} RegWrite={aControl.RegWrite}
        </div>
        <div>
          MemRead={aControl.MemRead} MemWrite={aControl.MemWrite} Branch={aControl.Branch} ALUOp={aControl.ALUOp}
        </div>
        {showCritical ? (
          <div className='text-[#f97316]'>
            critical: {aCritical.length} components · {aDelay} ps
          </div>
        ) : undefined}
      </div>
      {selected === undefined ? undefined : (
        <div
          className={cn(
            'absolute top-1/2 right-4 w-72 -translate-y-1/2 p-4 max-sm:inset-x-2 max-sm:top-auto max-sm:bottom-24 max-sm:w-auto max-sm:translate-y-0',
            PANEL
          )}>
          <div className='flex items-center justify-between'>
            <span className='font-mono font-bold text-[#a855f7]'>{selected}</span>
            <button onClick={() => setSelected(undefined)} type='button'>
              <X className='size-4' />
            </button>
          </div>
          <p className='mt-2 text-sm'>{ROLE.get(selected) ?? 'datapath component'}</p>
          {aValues[selected] === undefined ? undefined : (
            <p className='mt-2 rounded bg-muted/50 px-2 py-1 font-mono text-sm text-[#22d3ee]'>{aValues[selected]}</p>
          )}
          <ul className='mt-2 space-y-0.5 font-mono text-xs text-muted-foreground'>
            <li>
              active in {step}: {activeC.has(selected) ? 'yes' : 'no'}
            </li>
            <li>on critical path: {aCritical.includes(selected) ? 'yes' : 'no'}</li>
          </ul>
        </div>
      )}
      {live !== undefined && live.count > 1 ? (
        <div
          className={cn(
            '-translate-x-1/2 absolute bottom-32 left-1/2 flex items-center gap-2 px-2 py-1 font-mono text-xs',
            PANEL
          )}>
          <button
            aria-label='previous instruction'
            className='rounded p-1 hover:bg-muted disabled:opacity-40'
            disabled={live.idx === 0}
            onClick={() => setInsIndex(i => Math.max(0, i - 1))}
            type='button'>
            <ChevronLeft className='size-4' />
          </button>
          <span>
            instr {live.idx + 1}/{live.count} · {liveProgram[live.idx]?.name}
          </span>
          <button
            aria-label='next instruction'
            className='rounded p-1 hover:bg-muted disabled:opacity-40'
            disabled={live.idx >= live.count - 1}
            onClick={() => setInsIndex(i => Math.min(live.count - 1, i + 1))}
            type='button'>
            <ChevronRight className='size-4' />
          </button>
        </div>
      ) : undefined}
      <div
        aria-label='datapath step'
        className={cn('-translate-x-1/2 absolute bottom-6 left-1/2 flex items-center gap-1 p-1.5', PANEL)}
        role='tablist'>
        <button
          aria-label={playing ? 'pause' : 'play'}
          className='mr-1 rounded-lg p-1.5 hover:bg-muted'
          onClick={() => setPlaying(v => !v)}
          type='button'>
          {playing ? <Pause className='size-4' /> : <Play className='size-4' />}
        </button>
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
      {hint ? (
        <div
          className={cn(
            '-translate-x-1/2 absolute bottom-24 left-1/2 px-4 py-2 text-center text-sm text-muted-foreground',
            PANEL
          )}>
          drag to orbit · scroll to zoom · click a component to inspect
        </div>
      ) : undefined}
      <div
        className={cn(
          '-translate-x-1/2 absolute bottom-20 left-1/2 flex max-w-[90vw] flex-wrap justify-center gap-x-3 gap-y-0.5 px-3 py-1.5 font-mono text-xs max-sm:hidden',
          PANEL
        )}>
        {valueEntries.map(([id, v]) => (
          <button
            className={cn('hover:text-foreground', selected === id ? 'text-[#a855f7]' : 'text-muted-foreground')}
            key={id}
            onClick={() => setSelected(id)}
            type='button'>
            <span className='text-foreground'>{id}</span> {v}
          </button>
        ))}
      </div>
      <DatapathA11yProxies
        activeComponents={activeList}
        control={aControl}
        name={name}
        onSelect={setSelected}
        selected={selected}
      />
    </div>
  )
}
export default DatapathWorkspace
