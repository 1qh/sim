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
import type { ControlSignals, Instruction, RegisterNumber } from '@/features/mips/types'
import CompareIsland from '@/features/compare/compare-island'
import { criticalComponents, criticalPath } from '@/features/critical-path'
import { datapathValues } from '@/features/datapath/values'
import {
  controlFor,
  createInitialState,
  decodeInstruction,
  encodeInstruction,
  executeStep,
  writeRegister
} from '@/features/mips'

const build = (name: string): Instruction => {
  if (name === 'addi' || name === 'lw' || name === 'sw' || name === 'ori' || name === 'andi')
    return {
      imm: 4,
      name: name as Instruction['name'],
      opcode: name === 'lw' ? 0x23 : name === 'sw' ? 0x2b : name === 'ori' ? 0x0d : name === 'andi' ? 0x0c : 0x08,
      rs: 1 as RegisterNumber,
      rt: 2 as RegisterNumber,
      type: 'I'
    }
  if (name === 'beq' || name === 'bne')
    return {
      imm: 2,
      name,
      opcode: name === 'beq' ? 0x04 : 0x05,
      rs: 1 as RegisterNumber,
      rt: 2 as RegisterNumber,
      type: 'I'
    }
  const functMap: Record<string, number> = { add: 0x20, and: 0x24, nor: 0x27, or: 0x25, slt: 0x2a, sub: 0x22 }
  return {
    funct: functMap[name] ?? 0x20,
    name: name as Instruction['name'],
    rd: 3 as RegisterNumber,
    rs: 1 as RegisterNumber,
    rt: 2 as RegisterNumber,
    shamt: 0,
    type: 'R'
  }
}
const diffControl = (a: ControlSignals, b: ControlSignals): string[] => {
  const out: string[] = []
  for (const k of Object.keys(a) as (keyof ControlSignals)[]) if (a[k] !== b[k]) out.push(`${k}: ${a[k]} → ${b[k]}`)
  return out
}
const pane = (name: string) => {
  const ins = build(name)
  const seeded = writeRegister(writeRegister(createInitialState(), 1, 10), 2, 3)
  const word = encodeInstruction(ins)
  const stepRes = executeStep(seeded, word, decodeInstruction(word))
  return {
    control: controlFor(ins),
    critical: criticalComponents(ins, 'timing'),
    criticalDelayPs: criticalPath(ins, 'timing').delayPs,
    name,
    values: datapathValues(seeded, stepRes.nextState, ins)
  }
}
const Page = async ({ searchParams }: { searchParams: Promise<{ l?: string; r?: string }> }) => {
  const sp = await searchParams
  const left = pane(sp.l ?? 'add')
  const right = pane(sp.r ?? 'addi')
  return (
    <main aria-label='compare' className='mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-8 pt-20'>
      <h1 className='text-3xl font-bold tracking-tight'>
        Compare · {left.name} vs {right.name}
      </h1>
      <CompareIsland controlDiff={diffControl(left.control, right.control)} left={left} right={right} />
    </main>
  )
}
export default Page
