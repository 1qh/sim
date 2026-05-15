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
/* eslint-disable @typescript-eslint/max-params, no-namespace */
import { describe, expect, test } from 'bun:test'
import type { Instruction, RegisterNumber } from '../mips/types'
import { analyzePipeline, detectWar, detectWaw } from './index'
const r = (rd: number, rs: number, rt: number, name: 'add' | 'and' | 'or' | 'sub' = 'add', funct = 0x20): Instruction => ({
  funct,
  name,
  rd: rd as RegisterNumber,
  rs: rs as RegisterNumber,
  rt: rt as RegisterNumber,
  shamt: 0,
  type: 'R'
})
const lw = (rt: number, rs: number, imm = 0): Instruction => ({
  imm,
  name: 'lw',
  opcode: 0x23,
  rs: rs as RegisterNumber,
  rt: rt as RegisterNumber,
  type: 'I'
})
const beq = (rs: number, rt: number, imm = 0): Instruction => ({
  imm,
  name: 'beq',
  opcode: 0x04,
  rs: rs as RegisterNumber,
  rt: rt as RegisterNumber,
  type: 'I'
})
describe('pipeline RAW hazard', () => {
  test('add $3,$1,$2 → add $5,$3,$4 produces RAW + EX→EX forwarding (no stall)', () => {
    const program = [r(3, 1, 2), r(5, 3, 4)]
    const report = analyzePipeline(program)
    expect(report.hazards.find(h => h.kind === 'RAW' && h.register === 3)).toBeDefined()
    expect(report.forwarding.find(f => f.fromStage === 'EX' && f.toStage === 'EX')).toBeDefined()
    expect(report.stalls).toBe(0)
  })
  test('lw $3 → use $3 next requires 1 stall + MEM→EX forwarding', () => {
    const program = [lw(3, 1, 0), r(5, 3, 4)]
    const report = analyzePipeline(program)
    expect(report.stalls).toBeGreaterThanOrEqual(1)
    expect(report.hazards.some(h => h.kind === 'RAW')).toBe(true)
  })
})
describe('pipeline WAW hazard', () => {
  test('two writes to $3 register detected', () => {
    const program = [r(3, 1, 2), r(3, 4, 5)]
    const hazards = detectWaw(program)
    expect(hazards.length).toBe(1)
    expect((hazards[0] as { register: number }).register).toBe(3 as RegisterNumber)
  })
})
describe('pipeline WAR hazard', () => {
  test('reader-before-writer with same reg detected', () => {
    const program = [r(7, 3, 4), r(3, 5, 6)]
    const hazards = detectWar(program)
    expect(hazards.some(h => h.kind === 'WAR' && h.register === 3)).toBe(true)
  })
})
describe('pipeline control hazard', () => {
  test('beq taken inserts control stall', () => {
    const program = [beq(0, 0, 4), r(3, 1, 2)]
    const taken = new Set([0])
    const report = analyzePipeline(program, { takenBranches: taken })
    expect(report.hazards.some(h => h.kind === 'control')).toBe(true)
    expect(report.stalls).toBeGreaterThanOrEqual(1)
  })
})
describe('pipeline forwarding', () => {
  test('forwarding flag disables MEM→EX bypass and forces stalls', () => {
    const program = [r(3, 1, 2), r(5, 3, 4)]
    const withFwd = analyzePipeline(program, { enableForwarding: true })
    const noFwd = analyzePipeline(program, { enableForwarding: false })
    expect(noFwd.stalls).toBeGreaterThan(withFwd.stalls)
  })
})
describe('pipeline stall accounting', () => {
  test('cycleCount = startOfLast + 5', () => {
    const program = [r(3, 1, 2), r(5, 3, 4), r(7, 5, 6)]
    const report = analyzePipeline(program)
    expect(report.cycleCount).toBe((report.rows.at(-1) as { startCycle: number }).startCycle + 5)
  })
  test('CPI ≥ 1 always', () => {
    const program = [r(3, 1, 2), r(5, 3, 4), r(7, 5, 6)]
    const report = analyzePipeline(program)
    expect(report.cpi).toBeGreaterThanOrEqual(1)
  })
  test('empty program produces zero cycles', () => {
    const report = analyzePipeline([])
    expect(report.cycleCount).toBe(0)
    expect(report.cpi).toBe(0)
  })
})
