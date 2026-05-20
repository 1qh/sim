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
import { LEARN_PAGES } from '@/features/learn/manifest'
import { LEARN_REGISTRY } from '@/features/learn/registry'

const generateStaticParams = async () => LEARN_PAGES.map(p => ({ slug: p.slug }))
const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug: key } = await params
  const Content = LEARN_REGISTRY[key]
  if (!Content) notFound()
  return (
    <main aria-label={`learn ${key}`} className='mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8'>
      <article className='prose-sm flex flex-col gap-3'>
        <Content />
      </article>
      <Link className='text-sm underline' href='/learn'>
        all lessons
      </Link>
    </main>
  )
}
export { generateStaticParams }
export default Page
