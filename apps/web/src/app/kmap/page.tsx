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

const CASES = ['v2', 'v3', 'v4', 'v4-pos', 'v5', 'v5-wrap', 'v6', 'v6-wrap']
const Page = (): React.JSX.Element => (
  <main aria-label='kmap index' className='mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8'>
    <h1 className='text-3xl font-bold'>Karnaugh map</h1>
    <p className='text-muted-foreground'>2D grouping for ≤4 vars, 3D toroidal for 5–6. Pick a case.</p>
    <ul className='grid grid-cols-2 gap-2 font-mono sm:grid-cols-4 [&>li>a]:block [&>li>a]:rounded-lg [&>li>a]:border [&>li>a]:px-3 [&>li>a]:py-2 [&>li>a]:text-center [&>li>a]:transition hover:[&>li>a]:bg-muted'>
      {CASES.map(c => (
        <li key={c}>
          <Link href={`/kmap/${c}`}>{c}</Link>
        </li>
      ))}
    </ul>
    <Link className='text-sm underline' href='/'>
      back
    </Link>
  </main>
)
export default Page
