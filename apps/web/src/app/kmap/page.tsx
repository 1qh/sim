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
import { kmap } from '@/features/kmap'
const Page = () => {
  const result = kmap({ expression: '(A&B) | (B&C) | (A&C)' })
  return (
    <main className='flex min-h-screen flex-col gap-8 p-8'>
      <h1 className='text-3xl font-bold'>Karnaugh map</h1>
      <p className='text-muted-foreground'>2D for ≤4 vars, 3D toroidal for 5-6 vars.</p>
      <section aria-label='kmap-result' className='space-y-2 rounded-lg border p-4 font-mono text-sm'>
        <div>geometry: {result.geometry}</div>
        <div>vars: {result.vars.join(', ')}</div>
        <div>minterms: {result.minterms.join(', ')}</div>
        <div>SOP: {result.minimalSop}</div>
        <div>POS: {result.minimalPos}</div>
      </section>
      <Link className='text-sm underline' href='/'>
        back
      </Link>
    </main>
  )
}
export default Page
