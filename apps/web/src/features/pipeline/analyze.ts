/** biome-ignore-all lint/nursery/noContinue: noise */
/* eslint-disable complexity, max-depth, no-continue */
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
const analyzePipeline = (
  instructions: Instruction[],
  options: { enableForwarding?: boolean; takenBranches?: Set<number> } = {}
): PipelineReport => {
  const enableForwarding = options.enableForwarding ?? true
  const taken = options.takenBranches ?? new Set<number>()
  const startCycles: number[] = []
  const hazards: Hazard[] = []
  const forwarding: ForwardingArrow[] = []
  let stalls = 0
  for (const [i, ins] of instructions.entries()) {
    const prevStart = i === 0 ? 0 : (startCycles[i - 1] ?? 0)
    let start = i === 0 ? 0 : prevStart + 1
    const consumed = readsRegisters(ins)
    for (const reg of consumed)
      for (let j = i - 1; j >= 0; j -= 1) {
        const producer = instructions[j]
        const producerStart = startCycles[j]
        if (producer === undefined || producerStart === undefined) continue
        const written = writesRegister(producer)
        if (written === reg && reg !== 0) {
          const producerExEnd = producerStart + 3
          const producerMemEnd = producerStart + 4
          const producerWbEnd = producerStart + 5
          const consumerEx = start + 2
          const consumerId = start + 1
          if (enableForwarding) {
            if (isLoad(producer)) {
              const required = producerMemEnd
              if (consumerEx < required) {
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
            } else if (consumerEx < producerExEnd) {
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
          } else if (consumerId < producerWbEnd) {
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
    const prevIns = i > 0 ? instructions[i - 1] : undefined
    if (i > 0 && prevIns !== undefined && isBranchOrJump(prevIns) && taken.has(i - 1)) {
      stalls += 1
      const prevStartCycle = startCycles[i - 1] ?? 0
      start = Math.max(start, prevStartCycle + 2)
      hazards.push({
        consumerCycle: start,
        consumerIndex: i,
        kind: 'control',
        producerCycle: prevStartCycle + 1,
        producerIndex: i - 1,
        register: undefined
      })
    }
    startCycles.push(start)
  }
  const lastStart = startCycles.length === 0 ? 0 : (startCycles.at(-1) ?? 0)
  const cycleCount = instructions.length === 0 ? 0 : lastStart + STAGES.length
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
      if (insB === undefined) continue
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
  return hazards
}
const detectWaw = (instructions: Instruction[]): Hazard[] => {
  const hazards: Hazard[] = []
  for (const [i, insA] of instructions.entries()) {
    const writtenA = writesRegister(insA)
    if (writtenA === undefined || writtenA === 0) continue
    for (let j = i + 1; j < instructions.length; j += 1) {
      const insB = instructions[j]
      if (insB === undefined) continue
      const writtenB = writesRegister(insB)
      if (writtenB === writtenA)
        hazards.push({
          consumerCycle: 0,
          consumerIndex: j,
          kind: 'WAW',
          producerCycle: undefined,
          producerIndex: i,
          register: writtenA
        })
    }
  }
  return hazards
}
export { analyzePipeline, detectWar, detectWaw, isBranchOrJump, isLoad, readsRegisters, STAGES, writesRegister }
