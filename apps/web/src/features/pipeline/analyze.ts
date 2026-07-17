/* eslint-disable @typescript-eslint/switch-exhaustiveness-check */
import type { Instruction, RegisterNumber } from '../mips/types'
import type { ForwardingArrow, Hazard, PipelineReport, PipelineRow, Stage } from './types'

const STAGES: Stage[] = ['IF', 'ID', 'EX', 'MEM', 'WB']
const writesRegister = (ins: Instruction): RegisterNumber | undefined => {
  if (ins.type === 'R') {
    if (ins.name === 'jr') return
    return ins.rd
  }
  if (ins.type === 'I')
    switch (ins.name) {
      case 'addi':
      case 'andi':
      case 'lui':
      case 'lw':
      case 'ori':
      case 'xori':
        return ins.rt
      default:
        return
    }
  if (ins.name === 'jal') return 31
}
const readsRegisters = (ins: Instruction): RegisterNumber[] => {
  if (ins.type === 'R') {
    if (ins.name === 'sll' || ins.name === 'srl' || ins.name === 'sra') return [ins.rt]
    if (ins.name === 'jr') return [ins.rs]
    return [ins.rs, ins.rt]
  }
  if (ins.type === 'I') {
    if (ins.name === 'lui') return []
    if (ins.name === 'beq' || ins.name === 'bne' || ins.name === 'sw') return [ins.rs, ins.rt]
    return [ins.rs]
  }
  return []
}
const isLoad = (ins: Instruction): boolean => ins.type === 'I' && ins.name === 'lw'
const isBranchOrJump = (ins: Instruction): boolean => {
  if (ins.type === 'J') return true
  if (ins.type === 'R' && ins.name === 'jr') return true
  if (ins.type === 'I' && (ins.name === 'beq' || ins.name === 'bne')) return true
  return false
}
const resolveRaw = ({
  enableForwarding,
  forwarding,
  hazards,
  i,
  instructions,
  reg,
  stallInsertion,
  startCycles,
  startIn
}: {
  enableForwarding: boolean
  forwarding: ForwardingArrow[]
  hazards: Hazard[]
  i: number
  instructions: Instruction[]
  reg: RegisterNumber
  stallInsertion: boolean
  startCycles: number[]
  startIn: number
  // eslint-disable-next-line sonarjs/cognitive-complexity -- RAW-hazard resolution walks producers × forwarding × stall-insertion; inherent pipeline-hazard branching after helper extraction
}): { stalls: number; start: number } => {
  let start = startIn
  let stalls = 0
  for (let j = i - 1; j >= 0; j -= 1) {
    const producer = instructions[j]
    const producerStart = startCycles[j]
    if (producer !== undefined && producerStart !== undefined && writesRegister(producer) === reg && reg !== 0) {
      const producerExEnd = producerStart + 3
      const producerMemEnd = producerStart + 4
      const producerWbEnd = producerStart + 5
      const consumerEx = start + 2
      const consumerId = start + 1
      if (enableForwarding) {
        if (isLoad(producer)) {
          const required = producerMemEnd
          // eslint-disable-next-line max-depth -- RAW load-use forwarding is inherently nested (guard × forwarding-mode × load-vs-alu × stall); flattening obscures the pipeline logic
          if (consumerEx < required && stallInsertion) {
            const need = required - consumerEx
            start += need
            stalls += need
          } else forwarding.push({ fromIndex: j, fromStage: 'MEM', register: reg, toIndex: i, toStage: 'EX' })
          hazards.push({
            consumerCycle: start + 2,
            consumerIndex: i,
            kind: 'RAW',
            producerCycle: producerMemEnd,
            producerIndex: j,
            register: reg
          })
        } else if (consumerEx < producerExEnd && stallInsertion) {
          const need = producerExEnd - consumerEx
          start += need
          stalls += need
        } else if (consumerEx >= producerExEnd && consumerEx < producerWbEnd) {
          forwarding.push({ fromIndex: j, fromStage: 'EX', register: reg, toIndex: i, toStage: 'EX' })
          hazards.push({
            consumerCycle: start + 2,
            consumerIndex: i,
            kind: 'RAW',
            producerCycle: producerExEnd,
            producerIndex: j,
            register: reg
          })
        }
      } else if (consumerId < producerWbEnd && stallInsertion) {
        const need = producerWbEnd - consumerId
        start += need
        stalls += need
        hazards.push({
          consumerCycle: start + 1,
          consumerIndex: i,
          kind: 'RAW',
          producerCycle: producerWbEnd,
          producerIndex: j,
          register: reg
        })
      }
      break
    }
  }
  return { stalls, start }
}
const applyControlHazard = ({
  hazards,
  i,
  instructions,
  startCycles,
  startIn,
  taken
}: {
  hazards: Hazard[]
  i: number
  instructions: Instruction[]
  startCycles: number[]
  startIn: number
  taken: Set<number>
}): { stalls: number; start: number } => {
  const prevIns = i > 0 ? instructions[i - 1] : undefined
  if (i > 0 && prevIns !== undefined && isBranchOrJump(prevIns) && taken.has(i - 1)) {
    const prevStartCycle = startCycles[i - 1] ?? 0
    const start = Math.max(startIn, prevStartCycle + 2)
    hazards.push({
      consumerCycle: start,
      consumerIndex: i,
      kind: 'control',
      producerCycle: prevStartCycle + 1,
      producerIndex: i - 1,
      register: undefined
    })
    return { stalls: 1, start }
  }
  return { stalls: 0, start: startIn }
}
const buildRows = (instructions: Instruction[], startCycles: number[], cycleCount: number): PipelineRow[] => {
  const rows: PipelineRow[] = []
  for (const [idx, ins] of instructions.entries()) {
    const startCycle = startCycles[idx] ?? 0
    const cells: ('bubble' | Stage | undefined)[] = []
    for (let c = 0; c < cycleCount; c += 1) {
      const offset = c - startCycle
      if (offset < 0 || offset >= STAGES.length) cells.push(undefined)
      else cells.push(STAGES[offset])
    }
    rows.push({ cellByCycle: cells, instruction: ins, startCycle })
  }
  return rows
}
const analyzePipeline = (
  instructions: Instruction[],
  options: { enableForwarding?: boolean; stallInsertion?: boolean; takenBranches?: Set<number> } = {}
): PipelineReport => {
  const enableForwarding = options.enableForwarding ?? true
  const stallInsertion = options.stallInsertion ?? true
  const taken = options.takenBranches ?? new Set<number>()
  const startCycles: number[] = []
  const hazards: Hazard[] = []
  const forwarding: ForwardingArrow[] = []
  let stalls = 0
  for (const [i, ins] of instructions.entries()) {
    const prevStart = i === 0 ? 0 : (startCycles[i - 1] ?? 0)
    let start = i === 0 ? 0 : prevStart + 1
    for (const reg of readsRegisters(ins)) {
      const raw = resolveRaw({
        enableForwarding,
        forwarding,
        hazards,
        i,
        instructions,
        reg,
        stallInsertion,
        startCycles,
        startIn: start
      })
      ;({ start } = raw)
      stalls += raw.stalls
    }
    const ctrl = applyControlHazard({ hazards, i, instructions, startCycles, startIn: start, taken })
    ;({ start } = ctrl)
    stalls += ctrl.stalls
    startCycles.push(start)
  }
  const lastStart = startCycles.length === 0 ? 0 : (startCycles.at(-1) ?? 0)
  const cycleCount = instructions.length === 0 ? 0 : lastStart + STAGES.length
  const rows = buildRows(instructions, startCycles, cycleCount)
  const instructionCount = instructions.length
  const cpi = instructionCount === 0 ? 0 : cycleCount / instructionCount
  return { cpi, cycleCount, forwarding, hazards, instructionCount, rows, stalls }
}
const detectWar = (instructions: Instruction[]): Hazard[] => {
  const hazards: Hazard[] = []
  for (const [i, insA] of instructions.entries()) {
    const reads = readsRegisters(insA)
    for (let j = i + 1; j < instructions.length; j += 1) {
      const insB = instructions[j]
      if (insB !== undefined) {
        const written = writesRegister(insB)
        if (written !== undefined && reads.includes(written) && written !== 0)
          hazards.push({
            consumerCycle: 0,
            consumerIndex: j,
            kind: 'WAR',
            producerCycle: undefined,
            producerIndex: i,
            register: written
          })
      }
    }
  }
  return hazards
}
const wawFrom = (instructions: Instruction[], i: number, writtenA: RegisterNumber): Hazard[] => {
  const out: Hazard[] = []
  for (let j = i + 1; j < instructions.length; j += 1) {
    const insB = instructions[j]
    if (insB !== undefined && writesRegister(insB) === writtenA)
      out.push({
        consumerCycle: 0,
        consumerIndex: j,
        kind: 'WAW',
        producerCycle: undefined,
        producerIndex: i,
        register: writtenA
      })
  }
  return out
}
const detectWaw = (instructions: Instruction[]): Hazard[] => {
  const hazards: Hazard[] = []
  for (const [i, insA] of instructions.entries()) {
    const writtenA = writesRegister(insA)
    if (writtenA !== undefined && writtenA !== 0) hazards.push(...wawFrom(instructions, i, writtenA))
  }
  return hazards
}
export { analyzePipeline, detectWar, detectWaw, isBranchOrJump, isLoad, readsRegisters, STAGES, writesRegister }
