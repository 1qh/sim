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
import type { RegisterNumber } from '../mips/types'
import { createInitialState, decodeInstruction, encodeInstruction, executeStep, writeRegister } from '../mips/index'
import { diffMemory, diffRegisters, diffSteps, stepsEqual } from './index'
const makeR = (rd: number, rs: number, rt: number, name: 'add' | 'sub' = 'add', funct = 0x20) => ({
  funct,
  name,
  rd: rd as RegisterNumber,
  rs: rs as RegisterNumber,
  rt: rt as RegisterNumber,
  shamt: 0,
  type: 'R' as const
})
const stepWith = (
  initialOverride: (s: ReturnType<typeof createInitialState>) => ReturnType<typeof createInitialState>,
  ins: Parameters<typeof encodeInstruction>[0]
) => {
  const state = initialOverride(createInitialState())
  const word = encodeInstruction(ins)
  const decoded = decodeInstruction(word)
  return executeStep(state, word, decoded)
}
describe('diffRegisters', () => {
  test('detects single register change', () => {
    const a = createInitialState()
    const b = writeRegister(a, 5, 42)
    const d = diffRegisters(a, b)
    expect(d).toHaveLength(1)
    expect((d[0] as { index: number }).index).toBe(5 as RegisterNumber)
    expect((d[0] as { before: number }).before).toBe(0)
    expect((d[0] as { after: number }).after).toBe(42)
  })
})
describe('diffMemory', () => {
  test('detects added address', () => {
    const a = createInitialState()
    const b = { ...a, dataMemory: { ...a.dataMemory, 256: 0xde_ad } }
    const d = diffMemory(a, b)
    expect(d).toHaveLength(1)
    expect((d[0] as { address: number }).address).toBe(0x1_00)
  })
})
describe('diffSteps', () => {
  test('add vs sub produces register delta + control identity', () => {
    const seed = (s: ReturnType<typeof createInitialState>) => writeRegister(writeRegister(s, 1, 10), 2, 3)
    const left = stepWith(seed, makeR(3, 1, 2, 'add', 0x20))
    const right = stepWith(seed, makeR(3, 1, 2, 'sub', 0x22))
    const d = diffSteps(left, right)
    expect(d.registerDiffs.length).toBe(1)
    expect((d.registerDiffs[0] as { before: number }).before).toBe(13)
    expect((d.registerDiffs[0] as { after: number }).after).toBe(7)
    expect(d.hashAfterLeft).not.toBe(d.hashAfterRight)
  })
  test('identical instructions produce empty diff', () => {
    const seed = (s: ReturnType<typeof createInitialState>) => writeRegister(writeRegister(s, 1, 10), 2, 3)
    const left = stepWith(seed, makeR(3, 1, 2, 'add', 0x20))
    const right = stepWith(seed, makeR(3, 1, 2, 'add', 0x20))
    expect(stepsEqual(left, right)).toBe(true)
  })
})
