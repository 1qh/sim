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
import Link from 'next/link'
import type { Instruction, RegisterNumber } from '@/features/mips/types'
import { analyzePipeline } from '@/features/pipeline'

const program: Instruction[] = [
  {
    funct: 0x20,
    name: 'add',
    rd: 3 as RegisterNumber,
    rs: 1 as RegisterNumber,
    rt: 2 as RegisterNumber,
    shamt: 0,
    type: 'R'
  },
  {
    funct: 0x20,
    name: 'add',
    rd: 5 as RegisterNumber,
    rs: 3 as RegisterNumber,
    rt: 4 as RegisterNumber,
    shamt: 0,
    type: 'R'
  }
]
const Page = () => {
  const report = analyzePipeline(program)
  return (
    <main className='flex min-h-screen flex-col gap-8 p-8'>
      <h1 className='text-3xl font-bold'>Pipeline analyzer</h1>
      <section aria-label='pipeline-summary' className='space-y-2 rounded-lg border p-4 font-mono text-sm'>
        <div>cycles: {report.cycleCount}</div>
        <div>stalls: {report.stalls}</div>
        <div>CPI: {report.cpi.toFixed(2)}</div>
        <div>hazards: {report.hazards.length}</div>
        <div>forwarding arrows: {report.forwarding.length}</div>
      </section>
      <Link className='text-sm underline' href='/'>
        back
      </Link>
    </main>
  )
}
export default Page
