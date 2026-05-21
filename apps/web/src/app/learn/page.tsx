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
  <main aria-label='learn index' className='mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-8 pt-20'>
    <header className='flex flex-col gap-2'>
      <h1 className='text-4xl font-bold tracking-tight'>Learn</h1>
      <p className='max-w-2xl text-lg text-muted-foreground'>
        Diagram-first pedagogy. Each lesson pairs the documented argument with an interactive 3D island — step the
        datapath, group a K-map, scrub a pipeline.
      </p>
    </header>
    <ol className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {LEARN_PAGES.map((p, i) => (
        <li key={p.slug}>
          <Link
            className='flex h-full flex-col gap-1 rounded-xl border p-4 transition hover:border-foreground hover:bg-muted'
            href={`/learn/${p.slug}`}>
            <span className='font-mono text-xs text-muted-foreground'>{String(i + 1).padStart(2, '0')}</span>
            <span className='font-medium'>{p.title}</span>
          </Link>
        </li>
      ))}
    </ol>
    <Link className='text-sm underline' href='/learn/foundation'>
      foundation demos
    </Link>
  </main>
)
export default Page
