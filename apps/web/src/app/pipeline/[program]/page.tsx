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
/* eslint-disable @typescript-eslint/max-params, @typescript-eslint/require-await */
import { notFound } from 'next/navigation'
import type { Instruction, RegisterNumber } from '@/features/mips/types'
import MapsSurface from '@/components/maps-surface'
import PipelineIsland from '@/features/pipeline/pipeline-island'

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
  return (
    <main aria-label={`pipeline-${program}`}>
      <MapsSurface label={`Pipeline · ${program}`}>
        <div className='size-full overflow-auto pt-20 pr-6 pb-8 pl-16'>
          <PipelineIsland instructions={config.instructions} />
        </div>
      </MapsSurface>
    </main>
  )
}
export { generateStaticParams }
export default Page
