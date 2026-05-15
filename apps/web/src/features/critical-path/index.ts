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
/* eslint-disable no-namespace */
import type { ControlSignals, Instruction } from '../mips/types'
import { controlFor } from '../mips/execute'
interface CriticalPath {
  delayPs: number
  edges: PathEdge[]
  mode: 'structural' | 'timing'
}
interface PathEdge {
  delayPs: number
  from: 'IF' | Segment
  reason: string
  to: 'WB' | Segment
}
type Segment =
  | 'ALU'
  | 'Branch'
  | 'ImmExtend'
  | 'MemAccess'
  | 'MuxALUSrc'
  | 'MuxMemToReg'
  | 'MuxPCSrc'
  | 'MuxRegDst'
  | 'PCIncrement'
  | 'PCMux'
  | 'RegFileRead'
  | 'RegFileWrite'
  | 'SignExtend'
const DELAYS_PS: Record<'IF' | 'WB' | Segment, number> = {
  ALU: 200,
  Branch: 80,
  IF: 100,
  ImmExtend: 50,
  MemAccess: 250,
  MuxALUSrc: 40,
  MuxMemToReg: 40,
  MuxPCSrc: 40,
  MuxRegDst: 40,
  PCIncrement: 60,
  PCMux: 40,
  RegFileRead: 150,
  RegFileWrite: 100,
  SignExtend: 50,
  WB: 80
}
const buildStructural = (instruction: Instruction): PathEdge[] => {
  const ctl: ControlSignals = controlFor(instruction)
  const edges: PathEdge[] = []
  edges.push({ delayPs: DELAYS_PS.IF, from: 'IF', reason: 'instruction fetch', to: 'PCIncrement' })
  edges.push({ delayPs: DELAYS_PS.PCIncrement, from: 'PCIncrement', reason: 'pc + 4', to: 'RegFileRead' })
  edges.push({ delayPs: DELAYS_PS.RegFileRead, from: 'RegFileRead', reason: 'read rs/rt', to: 'SignExtend' })
  if (ctl.ALUSrc === 1) {
    edges.push({ delayPs: DELAYS_PS.SignExtend, from: 'SignExtend', reason: 'sign-extend immediate', to: 'MuxALUSrc' })
    edges.push({ delayPs: DELAYS_PS.MuxALUSrc, from: 'MuxALUSrc', reason: 'ALU operand select', to: 'ALU' })
  } else edges.push({ delayPs: DELAYS_PS.SignExtend, from: 'SignExtend', reason: 'pass-through', to: 'ALU' })
  edges.push({ delayPs: DELAYS_PS.ALU, from: 'ALU', reason: 'ALU compute', to: 'MemAccess' })
  if (ctl.MemRead === 1 || ctl.MemWrite === 1)
    edges.push({ delayPs: DELAYS_PS.MemAccess, from: 'MemAccess', reason: 'data memory access', to: 'MuxMemToReg' })
  if (ctl.RegWrite === 1) {
    edges.push({
      delayPs: DELAYS_PS.MuxMemToReg,
      from: 'MuxMemToReg',
      reason: 'write-back source select',
      to: 'RegFileWrite'
    })
    edges.push({ delayPs: DELAYS_PS.RegFileWrite, from: 'RegFileWrite', reason: 'register file write', to: 'WB' })
  }
  if (ctl.Branch === 1 || ctl.BranchNE === 1) {
    edges.push({ delayPs: DELAYS_PS.Branch, from: 'Branch', reason: 'branch decision', to: 'MuxPCSrc' })
    edges.push({ delayPs: DELAYS_PS.MuxPCSrc, from: 'MuxPCSrc', reason: 'pc-source select', to: 'PCMux' })
  }
  return edges
}
const sumDelay = (edges: PathEdge[]): number => edges.reduce((s, e) => s + e.delayPs, 0)
const criticalPath = (instruction: Instruction, mode: 'structural' | 'timing' = 'structural'): CriticalPath => {
  const edges = buildStructural(instruction)
  if (mode === 'structural') return { delayPs: edges.length, edges, mode }
  return { delayPs: sumDelay(edges), edges, mode }
}
const longestProgramPath = (instructions: Instruction[], mode: 'structural' | 'timing' = 'structural'): CriticalPath => {
  let best: CriticalPath = { delayPs: 0, edges: [], mode }
  for (const ins of instructions) {
    const p = criticalPath(ins, mode)
    if (p.delayPs > best.delayPs) best = p
  }
  return best
}
export { buildStructural, criticalPath, DELAYS_PS, longestProgramPath, sumDelay }
export type { CriticalPath, PathEdge, Segment }
