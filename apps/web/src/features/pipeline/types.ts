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
