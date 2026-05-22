/* eslint-disable @typescript-eslint/no-unnecessary-condition */
'use client'
import { cn } from '@a/ui'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { ControlSignals, MachineState, RegisterNumber } from '@/features/mips/types'

const PANEL = 'border bg-background/90 shadow-lg backdrop-blur-md'
const REG_NAMES = [
  '$zero',
  '$at',
  '$v0',
  '$v1',
  '$a0',
  '$a1',
  '$a2',
  '$a3',
  '$t0',
  '$t1',
  '$t2',
  '$t3',
  '$t4',
  '$t5',
  '$t6',
  '$t7',
  '$s0',
  '$s1',
  '$s2',
  '$s3',
  '$s4',
  '$s5',
  '$s6',
  '$s7',
  '$t8',
  '$t9',
  '$k0',
  '$k1',
  '$gp',
  '$sp',
  '$fp',
  '$ra'
]
const TABS = ['Values', 'Registers', 'Memory', 'Control'] as const
type Tab = (typeof TABS)[number]
const Row = ({ k, v, hot }: { hot?: boolean; k: string; v: string }): React.JSX.Element => (
  <div className={cn('flex justify-between gap-3 px-3 py-1', hot === true && 'bg-[#22d3ee]/10 text-[#22d3ee]')}>
    <span className='text-muted-foreground'>{k}</span>
    <span className='text-foreground'>{v}</span>
  </div>
)
const DatapathPanel = ({
  control,
  values,
  after,
  before
}: {
  after: MachineState
  before: MachineState
  control: ControlSignals
  values: Record<string, string>
}): React.JSX.Element => {
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<Tab>('Values')
  const mem = Object.entries(after.dataMemory)
  return (
    <div className='absolute top-0 right-0 bottom-0 flex items-stretch'>
      <button
        aria-label={open ? 'hide panel' : 'show panel'}
        className={cn('my-auto flex h-12 w-5 items-center justify-center rounded-l-lg', PANEL)}
        onClick={() => setOpen(o => !o)}
        type='button'>
        {open ? <ChevronRight className='size-4' /> : <ChevronLeft className='size-4' />}
      </button>
      {open ? (
        <div className={cn('flex w-72 flex-col overflow-hidden font-mono text-xs', PANEL)}>
          <div className='flex border-b [&>button]:flex-1 [&>button]:py-2'>
            {TABS.map(t => (
              <button
                className={cn(t === tab ? 'bg-muted font-medium' : 'text-muted-foreground hover:bg-muted/50')}
                key={t}
                onClick={() => setTab(t)}
                type='button'>
                {t === 'Registers' ? 'Reg' : t === 'Memory' ? 'Mem' : t === 'Control' ? 'Ctrl' : 'Val'}
              </button>
            ))}
          </div>
          <div className='flex-1 divide-y overflow-auto'>
            {tab === 'Values' ? Object.entries(values).map(([k, v]) => <Row k={k} key={k} v={v} />) : undefined}
            {tab === 'Registers'
              ? REG_NAMES.map((nm, n) => (
                  <Row
                    hot={after.registers[n as RegisterNumber] !== before.registers[n as RegisterNumber]}
                    k={nm}
                    key={nm}
                    v={String(after.registers[n as RegisterNumber] ?? 0)}
                  />
                ))
              : undefined}
            {tab === 'Memory' ? (
              mem.length === 0 ? (
                <div className='px-3 py-2 text-muted-foreground'>no memory writes</div>
              ) : (
                mem.map(([addr, v]) => <Row k={`[${addr}]`} key={addr} v={String(v)} />)
              )
            ) : undefined}
            {tab === 'Control' ? Object.entries(control).map(([k, v]) => <Row k={k} key={k} v={String(v)} />) : undefined}
          </div>
        </div>
      ) : undefined}
    </div>
  )
}
export default DatapathPanel
