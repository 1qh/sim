import { describe, expect, test } from 'bun:test'
import type { Instruction, RegisterNumber } from '../mips/types'
import { criticalPath, DELAYS_PS, longestProgramPath, sumDelay } from './index'
const r = (rd: number, rs: number, rt: number, name = 'add' as const): Instruction => ({
  funct: 0x20,
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
describe('critical path structural', () => {
  test('R-type covers IF→Reg→ALU→Mux→Write', () => {
    const cp = criticalPath(r(3, 1, 2), 'structural')
    expect(cp.edges.length).toBeGreaterThanOrEqual(5)
    expect(cp.edges.some(e => e.from === 'ALU')).toBe(true)
    expect(cp.edges.some(e => e.to === 'WB')).toBe(true)
  })
  test('lw adds MemAccess segment', () => {
    const cp = criticalPath(lw(1, 2, 0), 'structural')
    expect(cp.edges.some(e => e.from === 'MemAccess')).toBe(true)
  })
  test('beq adds Branch+MuxPCSrc segments', () => {
    const cp = criticalPath(beq(1, 2, 4), 'structural')
    expect(cp.edges.some(e => e.from === 'Branch')).toBe(true)
    expect(cp.edges.some(e => e.from === 'MuxPCSrc')).toBe(true)
  })
})
describe('critical path timing', () => {
  test('lw timing > R-type timing (memory access dominates)', () => {
    const rt = criticalPath(r(3, 1, 2), 'timing').delayPs
    const lwt = criticalPath(lw(1, 2, 0), 'timing').delayPs
    expect(lwt).toBeGreaterThan(rt)
  })
  test('timing delay = sum of segment delays', () => {
    const cp = criticalPath(r(3, 1, 2), 'timing')
    expect(cp.delayPs).toBe(sumDelay(cp.edges))
  })
  test('every segment delay defined', () => {
    const cp = criticalPath(lw(1, 2, 0), 'timing')
    for (const e of cp.edges) expect(DELAYS_PS[e.from]).toBeGreaterThan(0)
  })
})
describe('longestProgramPath', () => {
  test('mixed program picks lw delay as max', () => {
    const program: Instruction[] = [r(3, 1, 2), lw(1, 2, 0), r(5, 1, 2)]
    const cp = longestProgramPath(program, 'timing')
    const lwSolo = criticalPath(lw(1, 2, 0), 'timing').delayPs
    expect(cp.delayPs).toBe(lwSolo)
  })
})
