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
import { LEARN_PAGES } from '@/features/learn/manifest'

const Page = () => (
  <main aria-label='learn index' className='mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8'>
    <h1 className='text-3xl font-bold'>Learn</h1>
    <p className='text-muted-foreground'>
      Diagram-first pedagogy. Each lesson pairs the documented argument with an interactive island.
    </p>
    <ol className='list-decimal pl-6 [&>li>a]:underline [&>li]:py-1'>
      {LEARN_PAGES.map(p => (
        <li key={p.slug}>
          <Link href={`/learn/${p.slug}`}>{p.title}</Link>
        </li>
      ))}
    </ol>
    <Link className='text-sm underline' href='/learn/foundation'>
      foundation demos
    </Link>
    <Link className='text-sm underline' href='/'>
      back
    </Link>
  </main>
)
export default Page
