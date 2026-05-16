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
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { hashValue } from '@sim/sim-engine'
import type { ExecutionStep, MachineState, RegisterNumber } from '../mips/types'
interface MemoryDiff {
  address: number
  after: number
  before: number
}
interface RegisterDiff {
  after: number
  before: number
  index: RegisterNumber
}
interface StepDiff {
  controlDifferences: string[]
  hashAfterLeft: string
  hashAfterRight: string
  memoryDiffs: MemoryDiff[]
  pcDelta: number
  registerDiffs: RegisterDiff[]
}
const diffRegisters = (a: MachineState, b: MachineState): RegisterDiff[] => {
  const out: RegisterDiff[] = []
  for (let i = 0 as RegisterNumber; i < 32; i = (i + 1) as RegisterNumber) {
    const av = a.registers[i] ?? 0
    const bv = b.registers[i] ?? 0
    if (av !== bv) out.push({ after: bv, before: av, index: i })
  }
  return out
}
const diffMemory = (a: MachineState, b: MachineState): MemoryDiff[] => {
  const addresses = new Set<number>([...Object.keys(a.dataMemory).map(Number), ...Object.keys(b.dataMemory).map(Number)])
  const out: MemoryDiff[] = []
  for (const address of addresses) {
    const av = a.dataMemory[address] ?? 0
    const bv = b.dataMemory[address] ?? 0
    if (av !== bv) out.push({ address, after: bv, before: av })
  }
  return out.toSorted((x, y) => x.address - y.address)
}
const diffSteps = (left: ExecutionStep, right: ExecutionStep): StepDiff => {
  const registerDiffs = diffRegisters(left.nextState, right.nextState)
  const memoryDiffs = diffMemory(left.nextState, right.nextState)
  const pcDelta = right.nextPc - left.nextPc
  const controlDifferences: string[] = []
  for (const key of Object.keys(left.control) as (keyof typeof left.control)[])
    if (left.control[key] !== right.control[key])
      controlDifferences.push(`${key}: ${left.control[key]} → ${right.control[key]}`)
  return {
    controlDifferences,
    hashAfterLeft: hashValue(left.nextState),
    hashAfterRight: hashValue(right.nextState),
    memoryDiffs,
    pcDelta,
    registerDiffs
  }
}
const stepsEqual = (left: ExecutionStep, right: ExecutionStep): boolean => {
  const d = diffSteps(left, right)
  return d.controlDifferences.length === 0 && d.memoryDiffs.length === 0 && d.registerDiffs.length === 0 && d.pcDelta === 0
}
export { diffMemory, diffRegisters, diffSteps, stepsEqual }
export type { MemoryDiff, RegisterDiff, StepDiff }
