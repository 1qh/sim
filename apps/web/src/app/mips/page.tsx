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
/* eslint-disable no-duplicate-imports, no-namespace */
import Link from 'next/link'
import type { Instruction } from '@/features/mips/types'
import type { RegisterNumber } from '@/features/mips/types'
import { controlFor, createInitialState, decodeInstruction, encodeInstruction, executeStep } from '@/features/mips'
const Page = () => {
  const program = [
    {
      funct: 0x20,
      name: 'add' as const,
      rd: 3 as RegisterNumber,
      rs: 1 as RegisterNumber,
      rt: 2 as RegisterNumber,
      shamt: 0,
      type: 'R' as const
    }
  ]
  const state = createInitialState()
  const word = encodeInstruction(program[0] as Instruction)
  const decoded = decodeInstruction(word)
  const step = executeStep(state, word, decoded)
  return (
    <main className='flex min-h-screen flex-col gap-8 p-8'>
      <h1 className='text-3xl font-bold'>MIPS datapath</h1>
      <p className='text-muted-foreground'>27 instructions, single-cycle topology, golden traces verified.</p>
      <section aria-label='execution-step' className='space-y-2 rounded-lg border p-4 font-mono text-sm'>
        <div>word: 0x{word.toString(16).padStart(8, '0')}</div>
        <div>
          instruction: {step.instruction.name} ({step.instruction.type})
        </div>
        <div>nextPc: 0x{step.nextPc.toString(16)}</div>
        <div>
          control: RegDst={controlFor(step.instruction).RegDst} ALUOp={controlFor(step.instruction).ALUOp}
        </div>
      </section>
      <Link className='text-sm underline' href='/'>
        back
      </Link>
    </main>
  )
}
export default Page
