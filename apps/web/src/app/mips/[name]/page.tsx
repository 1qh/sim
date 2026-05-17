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
/* eslint-disable @typescript-eslint/require-await */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Instruction, RegisterNumber } from '@/features/mips/types'
import { criticalComponents, criticalPath } from '@/features/critical-path'
import DatapathA11yProxies from '@/features/datapath/a11y/proxies'
import AsmEditor from '@/features/datapath/asm-editor'
import { activePaths, componentsForPaths } from '@/features/datapath/generated/stepTraces'
import DatapathIsland from '@/features/datapath/scene/datapath-island'
import {
  controlFor,
  createInitialState,
  decodeInstruction,
  encodeInstruction,
  executeStep,
  writeRegister
} from '@/features/mips'
import { FUNCT, OPCODE } from '@/features/mips/encode'
const NAMES = [
  'add',
  'addi',
  'and',
  'beq',
  'bne',
  'lw',
  'or',
  'slt',
  'sub',
  'sw',
  'andi',
  'j',
  'lui',
  'nor',
  'ori',
  'sll',
  'srl'
] as const
const buildInstruction = (name: (typeof NAMES)[number]): Instruction => {
  const functMap = FUNCT as Record<string, number>
  const opcodeMap = OPCODE as Record<string, number>
  if (name in FUNCT) {
    const funct = functMap[name]
    if (funct === undefined) throw new Error(`unreachable funct for ${name}`)
    return {
      funct,
      name,
      rd: 3 as RegisterNumber,
      rs: 1 as RegisterNumber,
      rt: 2 as RegisterNumber,
      shamt: 0,
      type: 'R' as const
    }
  }
  if (name === 'j') return { name: 'j', opcode: OPCODE.j, target: 0x1_00, type: 'J' }
  const opcode = opcodeMap[name]
  if (opcode === undefined) throw new Error(`unreachable opcode for ${name}`)
  return { imm: 0x10, name, opcode, rs: 1 as RegisterNumber, rt: 2 as RegisterNumber, type: 'I' }
}
const generateStaticParams = async () => NAMES.map(name => ({ name }))
const Page = async ({ params }: { params: Promise<{ name: string }> }) => {
  const { name } = await params
  if (!(NAMES as readonly string[]).includes(name)) notFound()
  const typed = name as (typeof NAMES)[number]
  const ins = buildInstruction(typed)
  const seeded = writeRegister(writeRegister(createInitialState(), 1, 10), 2, 3)
  const word = encodeInstruction(ins)
  const decoded = decodeInstruction(word)
  const step = executeStep(seeded, word, decoded)
  const ctl = controlFor(ins)
  const critical = criticalComponents(ins, 'timing')
  const criticalDelayPs = criticalPath(ins, 'timing').delayPs
  return (
    <main aria-label={`mips-${name}`} className='flex min-h-screen flex-col gap-8 p-8'>
      <h1 className='text-3xl font-bold'>MIPS · {name}</h1>
      <section aria-label='execution-step' className='space-y-1 rounded-lg border p-4 font-mono text-sm'>
        <div>word: 0x{word.toString(16).padStart(8, '0')}</div>
        <div>
          instruction: {decoded.name} ({decoded.type})
        </div>
        <div>nextPc: 0x{step.nextPc.toString(16)}</div>
        <div>
          control: RegDst={ctl.RegDst} ALUSrc={ctl.ALUSrc} MemToReg={ctl.MemToReg} RegWrite={ctl.RegWrite}
        </div>
        <div>
          {' '}
          MemRead={ctl.MemRead} MemWrite={ctl.MemWrite} Branch={ctl.Branch} BranchNE={ctl.BranchNE} ALUOp={ctl.ALUOp}
        </div>
      </section>
      <AsmEditor initial={`${name} $t0, $t1, $t2`} />
      <DatapathIsland control={ctl} critical={critical} criticalDelayPs={criticalDelayPs} name={name} />
      <DatapathA11yProxies activeComponents={componentsForPaths(activePaths(ctl, 'EX'))} control={ctl} name={name} />
      <Link className='text-sm underline' href='/mips'>
        back
      </Link>
    </main>
  )
}
export { generateStaticParams }
export default Page
