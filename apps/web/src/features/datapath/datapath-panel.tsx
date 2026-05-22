'use client'
import { cn } from '@a/ui'
import { ChevronLeft, PanelRight } from 'lucide-react'
import { useState } from 'react'
import type { Step } from '@/features/datapath/generated/stepTraces'
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
const TABS = ['Val', 'Reg', 'Mem', 'Ctrl', 'Info'] as const
type Tab = (typeof TABS)[number]
const HINT: Record<Tab, string> = {
  Ctrl: 'Control signals the Control unit decodes from the opcode.',
  Info: 'What each component does — highlighted ones are active in this stage.',
  Mem: 'Data memory contents (address → stored word).',
  Reg: 'Value held in each register ($zero–$ra); changed this run highlighted.',
  Val: 'Values flowing on the datapath this stage.'
}
const INSPECT: { id: string; sub: string; title: string }[] = [
  { id: 'PC', sub: 'Stores the address of the current instruction.', title: 'Program Counter (PC)' },
  { id: 'IM', sub: 'Uses the PC as an address and outputs the instruction stored there.', title: 'Instruction Memory' },
  {
    id: 'IR',
    sub: 'Holds the fetched instruction and exposes its bit fields to the datapath.',
    title: 'Instruction Register'
  },
  { id: 'Control', sub: 'Decodes the opcode into control signals for the datapath.', title: 'Control Unit' },
  { id: 'RF', sub: 'Reads two source registers and optionally writes one destination register.', title: 'Register File' },
  { id: 'SE', sub: 'Extends the 16-bit immediate field into a 32-bit signed value.', title: 'Sign Extend' },
  {
    id: 'RegDstMux',
    sub: 'Selects which instruction field becomes the register-file write address.',
    title: 'RegDst MUX'
  },
  { id: 'ALUSrcMux', sub: 'Selects the second input to the ALU.', title: 'ALUSrc MUX' },
  { id: 'ALUControl', sub: 'Decodes ALUOp + funct into the ALU operation.', title: 'ALU Control' },
  {
    id: 'ALU',
    sub: 'Computes arithmetic or logic results from two input operands.',
    title: 'Arithmetic Logic Unit (ALU)'
  },
  { id: 'Zero', sub: 'High when the ALU result is zero (used for branches).', title: 'Zero Flag' },
  { id: 'DM', sub: 'Reads from or writes to memory using the ALU result as address.', title: 'Data Memory' },
  { id: 'MemToRegMux', sub: 'Selects the data written back to the register file.', title: 'MemToReg MUX' },
  { id: 'Add4', sub: 'Adds 4 to the current PC to get the next sequential instruction address.', title: 'PC + 4 Adder' },
  { id: 'LS2', sub: 'Shifts the sign-extended immediate left by 2 for branch target calculation.', title: 'Left Shift 2' },
  { id: 'BranchAdder', sub: 'Adds PC + 4 to the shifted offset to compute the branch target.', title: 'Branch Adder' },
  { id: 'PCSrcMux', sub: 'Selects the next value written into the PC.', title: 'PCSrc MUX' }
]
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
  before,
  activeComponents,
  step
}: {
  activeComponents: readonly string[]
  after: MachineState
  before: MachineState
  control: ControlSignals
  step: Step
  values: Record<string, string>
}): React.JSX.Element => {
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<Tab>('Val')
  const mem = Object.entries(after.dataMemory)
  const active = new Set(activeComponents)
  return (
    <div className='absolute top-0 right-0 bottom-0 flex items-stretch'>
      <button
        aria-label={open ? 'hide details' : 'show details'}
        className={cn('my-auto flex w-7 flex-col items-center gap-1 rounded-l-lg py-3 text-[10px] tracking-wide', PANEL)}
        onClick={() => setOpen(o => !o)}
        type='button'>
        {open ? <ChevronLeft className='size-4 rotate-180' /> : <PanelRight className='size-4' />}
        {open ? undefined : <span className='[writing-mode:vertical-rl]'>DETAILS</span>}
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
                {t}
              </button>
            ))}
          </div>
          <p className='border-b bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground italic'>{HINT[tab]}</p>
          <div className='flex-1 divide-y overflow-auto'>
            {tab === 'Val' ? Object.entries(values).map(([k, v]) => <Row k={k} key={k} v={v} />) : undefined}
            {tab === 'Reg'
              ? REG_NAMES.map((nm, n) => (
                  <Row
                    hot={after.registers[n as RegisterNumber] !== before.registers[n as RegisterNumber]}
                    k={nm}
                    key={nm}
                    v={String(after.registers[n as RegisterNumber])}
                  />
                ))
              : undefined}
            {tab === 'Mem' ? (
              mem.length === 0 ? (
                <div className='px-3 py-2 text-muted-foreground'>no memory writes</div>
              ) : (
                mem.map(([addr, v]) => <Row k={`[${addr}]`} key={addr} v={String(v)} />)
              )
            ) : undefined}
            {tab === 'Ctrl' ? Object.entries(control).map(([k, v]) => <Row k={k} key={k} v={String(v)} />) : undefined}
            {tab === 'Info'
              ? INSPECT.map(c => (
                  <div className={cn('px-3 py-2', active.has(c.id) ? 'bg-[#dc2626]/10' : 'opacity-60')} key={c.id}>
                    <div className='flex items-center gap-2 font-medium text-foreground'>
                      {c.title}
                      {active.has(c.id) ? (
                        <span className='rounded bg-[#dc2626] px-1 text-[9px] text-white'>{step}</span>
                      ) : undefined}
                    </div>
                    <div className='text-muted-foreground'>{c.sub}</div>
                  </div>
                ))
              : undefined}
          </div>
        </div>
      ) : undefined}
    </div>
  )
}
export default DatapathPanel
