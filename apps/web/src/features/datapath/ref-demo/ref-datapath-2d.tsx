'use client'
import { useState } from 'react'
import type {
  DatapathInspectID,
  EncodedField,
  EncodedInstruction,
  RuntimeControlSignals
} from '@/features/datapath/ref-demo/ref-types'
import StaticDatapathSvg from '@/features/datapath/ref-demo/static-datapath-svg'

const field = (bin: string): EncodedField => ({
  bin,
  dec: String(Number.parseInt(bin, 2)),
  hex: `0x${Number.parseInt(bin, 2).toString(16)}`
})
const BITS: EncodedInstruction = {
  address: field('00000000000000000000000000'),
  full: field('00000001001010100100000000100000'),
  funct: field('100000'),
  immediate: field('0000000000000000'),
  opcode: field('000000'),
  rd: field('01000'),
  rs: field('01001'),
  rt: field('01010'),
  shamt: field('00010')
}
const SIGNALS: RuntimeControlSignals = {
  ALUOp: '10',
  ALUSrc: 0,
  Branch: 0,
  BranchNE: 0,
  MemRead: 0,
  MemToReg: 0,
  MemWrite: 0,
  RegDst: 1,
  RegWrite: 1
}
const black = (): string => 'black'
const oneFive = (): number => 1.5
const arrow = (): string => 'url(#arrow-black)'
const blue = (): string => '#2C1AF4'
const RefDatapath2D = (): React.JSX.Element => {
  const [selected, setSelected] = useState<DatapathInspectID | null>(null)
  return (
    <div className='flex size-full items-center justify-center overflow-auto p-4' data-testid='datapath-canvas'>
      <StaticDatapathSvg
        bits={BITS}
        muxFill={black}
        onInspect={id => setSelected(prev => (prev === id ? null : id))}
        selectedInspectId={selected}
        signalFill={blue}
        signals={SIGNALS}
        valueFill={black}
        wireArrow={arrow}
        wireFill={black}
        wireStroke={black}
        wireStrokeWidth={oneFive}
      />
    </div>
  )
}
export default RefDatapath2D
