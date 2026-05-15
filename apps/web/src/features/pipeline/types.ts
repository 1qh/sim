import type { Instruction, RegisterNumber } from '../mips/types'
interface ForwardingArrow {
  fromIndex: number
  fromStage: Stage
  register: RegisterNumber
  toIndex: number
  toStage: Stage
}
interface Hazard {
  consumerCycle: number
  consumerIndex: number
  kind: HazardKind
  producerCycle: number | undefined
  producerIndex: number | undefined
  register: RegisterNumber | undefined
}
type HazardKind = 'control' | 'RAW' | 'WAR' | 'WAW'
interface PipelineReport {
  cpi: number
  cycleCount: number
  forwarding: ForwardingArrow[]
  hazards: Hazard[]
  instructionCount: number
  rows: PipelineRow[]
  stalls: number
}
interface PipelineRow {
  cellByCycle: ('bubble' | Stage | undefined)[]
  instruction: Instruction
  startCycle: number
}
type Stage = 'EX' | 'ID' | 'IF' | 'MEM' | 'WB'
interface StageOccupancy {
  bubble: boolean
  index: number
  stage: Stage
}
export type { ForwardingArrow, Hazard, HazardKind, PipelineReport, PipelineRow, Stage, StageOccupancy }
