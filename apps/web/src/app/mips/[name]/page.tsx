import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Instruction, RegisterNumber } from '@/features/mips/types'
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
  if (name in FUNCT)
    return {
      funct: (FUNCT as Record<string, number>)[name]!,
      name,
      rd: 3 as RegisterNumber,
      rs: 1 as RegisterNumber,
      rt: 2 as RegisterNumber,
      shamt: 0,
      type: 'R' as const
    }
  if (name === 'j') return { name: 'j', opcode: OPCODE.j, target: 0x1_00, type: 'J' }
  return {
    imm: 0x10,
    name,
    opcode: (OPCODE as Record<string, number>)[name]!,
    rs: 1 as RegisterNumber,
    rt: 2 as RegisterNumber,
    type: 'I'
  }
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
      <Link className='text-sm underline' href='/mips'>
        back
      </Link>
    </main>
  )
}
export { generateStaticParams }
export default Page
