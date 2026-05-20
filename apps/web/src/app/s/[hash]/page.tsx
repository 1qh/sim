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
/* eslint-disable @typescript-eslint/no-use-before-define */
import Link from 'next/link'

const Page = ({ params }: { params: Promise<{ hash: string }> }) => <SharePage params={params} />
const SharePage = async ({ params }: { params: Promise<{ hash: string }> }) => {
  const { hash } = await params
  return (
    <main className='flex min-h-screen flex-col gap-8 p-8'>
      <h1 className='text-3xl font-bold'>Snapshot</h1>
      <p className='text-muted-foreground font-mono text-sm'>hash: {hash}</p>
      <Link className='text-sm underline' href='/'>
        back
      </Link>
    </main>
  )
}
export default Page
