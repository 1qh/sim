import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Instruction, RegisterNumber } from '@/features/mips/types'
import { analyzePipeline } from '@/features/pipeline'
const r = (rd: number, rs: number, rt: number, name: 'add' | 'sub' = 'add', funct = 0x20): Instruction => ({
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
const PROGRAMS: Record<string, { instructions: Instruction[]; takenBranches?: Set<number> }> = {
  control: { instructions: [beq(0, 0, 4), r(3, 1, 2)], takenBranches: new Set([0]) },
  forwarding: { instructions: [r(3, 1, 2), r(5, 3, 4), r(7, 5, 6)] },
  raw: { instructions: [r(3, 1, 2), r(5, 3, 4)] },
  stall: { instructions: [lw(3, 1), r(5, 3, 4)] },
  war: { instructions: [r(7, 3, 4), r(3, 5, 6)] },
  waw: { instructions: [r(3, 1, 2), r(3, 4, 5)] }
}
const generateStaticParams = async () => Object.keys(PROGRAMS).map(program => ({ program }))
const Page = async ({ params }: { params: Promise<{ program: string }> }) => {
  const { program } = await params
  const config = PROGRAMS[program]
  if (!config) notFound()
  const report = analyzePipeline(config.instructions, { takenBranches: config.takenBranches })
  return (
    <main aria-label={`pipeline-${program}`} className='flex min-h-screen flex-col gap-8 p-8'>
      <h1 className='text-3xl font-bold'>Pipeline · {program}</h1>
      <section aria-label='pipeline-report' className='space-y-1 rounded-lg border p-4 font-mono text-sm'>
        <div>instruction count: {report.instructionCount}</div>
        <div>cycles: {report.cycleCount}</div>
        <div>stalls: {report.stalls}</div>
        <div>CPI: {report.cpi.toFixed(2)}</div>
        <div>hazards: {report.hazards.map(h => h.kind).join(', ') || 'none'}</div>
        <div>forwarding: {report.forwarding.length}</div>
      </section>
      <Link className='text-sm underline' href='/pipeline'>
        back
      </Link>
    </main>
  )
}
export { generateStaticParams }
export default Page
