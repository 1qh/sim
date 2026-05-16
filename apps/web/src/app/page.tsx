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
const Page = () => (
  <main className='flex min-h-screen flex-col items-center justify-center gap-8 p-8'>
    <h1 className='text-5xl font-bold tracking-tight'>sim</h1>
    <p className='text-muted-foreground text-balance text-center text-lg'>
      Interactive 3D MIPS datapath and Karnaugh map visualizer.
    </p>
    <nav className='flex flex-wrap justify-center gap-4 [&>a]:rounded-lg [&>a]:border [&>a]:px-4 [&>a]:py-2 [&>a]:transition hover:[&>a]:bg-muted'>
      <Link href='/mips'>MIPS datapath</Link>
      <Link href='/kmap'>Karnaugh map</Link>
      <Link href='/pipeline'>Pipeline analyzer</Link>
      <Link href='/compare'>Compare</Link>
      <Link href='/learn'>Learn</Link>
    </nav>
  </main>
)
export default Page
