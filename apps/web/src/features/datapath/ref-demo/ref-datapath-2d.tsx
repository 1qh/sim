/** biome-ignore-all lint/suspicious/noBitwiseOperators: bit-field decode */
/* oxlint-disable unicorn/consistent-function-scoping, unicorn/number-literal-case */
/* eslint-disable no-bitwise */
'use client'
import { useMemo, useState } from 'react'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type {
  ControlSignalId,
  DatapathInspectID,
  DatapathSegment,
  DatapathValueId,
  EncodedField,
  EncodedInstruction,
  RuntimeControlSignals
} from '@/features/datapath/ref-demo/ref-types'
import type { ControlSignals } from '@/features/mips/types'
import { activePaths } from '@/features/datapath/generated/stepTraces'
import { getDatapathHighlightState, getHighlightSvgFill } from '@/features/datapath/ref-demo/ref-highlight'
import StaticDatapathSvg from '@/features/datapath/ref-demo/static-datapath-svg'
import { PATH_SEGMENTS } from '@/features/datapath/scene-2d/datapath-graph'

const ACTIVE = '#dc2626'
const field = (value: number, width: number): EncodedField => {
  const v = Math.trunc(value)
  return { bin: v.toString(2).padStart(width, '0').slice(-width), dec: String(v), hex: `0x${v.toString(16)}` }
}
const buildBits = (word: number): EncodedInstruction => ({
  address: field(word & 0x3_ff_ff_ff, 26),
  full: field(word, 32),
  funct: field(word & 0x3f, 6),
  immediate: field(word & 0xff_ff, 16),
  opcode: field((word >>> 26) & 0x3f, 6),
  rd: field((word >>> 11) & 0x1f, 5),
  rs: field((word >>> 21) & 0x1f, 5),
  rt: field((word >>> 16) & 0x1f, 5),
  shamt: field((word >>> 6) & 0x1f, 5)
})
const toRefSignals = (c: ControlSignals): RuntimeControlSignals => ({
  ALUOp: c.ALUOp === 0 ? '00' : c.ALUOp === 1 ? '01' : '10',
  ALUSrc: c.ALUSrc,
  Branch: c.Branch,
  BranchNE: c.BranchNE,
  MemRead: c.MemRead,
  MemToReg: c.MemToReg,
  MemWrite: c.MemWrite,
  RegDst: c.RegDst,
  RegWrite: c.RegWrite
})
const RefDatapath2D = ({
  control,
  step,
  word
}: {
  control: ControlSignals
  step: Step
  word: number
}): React.JSX.Element => {
  const [selected, setSelected] = useState<DatapathInspectID | null>(null)
  const bits = useMemo(() => buildBits(word), [word])
  const signals = useMemo(() => toRefSignals(control), [control])
  const activeSegs = useMemo(() => {
    const s = new Set<string>()
    for (const id of activePaths(control, step)) for (const seg of PATH_SEGMENTS[id] ?? []) s.add(seg)
    return s
  }, [control, step])
  const highlight = useMemo(() => getDatapathHighlightState(step, signals, signals, {}), [step, signals])
  const wireStroke = (id: DatapathSegment): string => (activeSegs.has(id) ? ACTIVE : 'black')
  const wireStrokeWidth = (id: DatapathSegment): number => (activeSegs.has(id) ? 2.3 : 1.5)
  const wireArrow = (id: DatapathSegment): string => (activeSegs.has(id) ? 'url(#arrow-red)' : 'url(#arrow-black)')
  const signalFill = (): string => '#2C1AF4'
  const muxFill = (s: ControlSignalId): string => getHighlightSvgFill(highlight.controls[s] ?? 'normal')
  const valueFill = (id: DatapathValueId): string => getHighlightSvgFill(highlight.values[id] ?? 'normal')
  return (
    <div className='absolute inset-0 flex items-center justify-center overflow-auto p-4' data-testid='datapath-canvas'>
      <StaticDatapathSvg
        bits={bits}
        muxFill={muxFill}
        onInspect={id => setSelected(prev => (prev === id ? null : id))}
        selectedInspectId={selected}
        signalFill={signalFill}
        signals={signals}
        valueFill={valueFill}
        wireArrow={wireArrow}
        wireFill={wireStroke}
        wireStroke={wireStroke}
        wireStrokeWidth={wireStrokeWidth}
      />
    </div>
  )
}
export default RefDatapath2D
