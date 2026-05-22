import Link from 'next/link'
import { PIPELINE_PROGRAMS } from '@/lib/nav'

const Page = (): React.JSX.Element => (
  <main aria-label='pipeline index' className='mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8'>
    <h1 className='text-3xl font-bold'>Pipeline analyzer</h1>
    <p className='text-muted-foreground'>Stage-time diagram + hazard detection. Pick a program.</p>
    <ul className='grid grid-cols-2 gap-2 font-mono sm:grid-cols-3 [&>li>a]:block [&>li>a]:rounded-lg [&>li>a]:border [&>li>a]:px-3 [&>li>a]:py-2 [&>li>a]:text-center [&>li>a]:transition hover:[&>li>a]:bg-muted'>
      {PIPELINE_PROGRAMS.map(p => (
        <li key={p}>
          <Link href={`/pipeline/${p}`}>{p}</Link>
        </li>
      ))}
    </ul>
  </main>
)
export default Page
