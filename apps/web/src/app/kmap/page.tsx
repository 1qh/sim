import Link from 'next/link'
import { KMAP_CASES } from '@/lib/nav'

const Page = (): React.JSX.Element => (
  <main aria-label='kmap index' className='mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8'>
    <h1 className='text-3xl font-bold'>Karnaugh map</h1>
    <p className='text-muted-foreground'>2D grouping for ≤4 vars, 3D toroidal for 5–6. Pick a case.</p>
    <ul className='grid grid-cols-2 gap-2 font-mono sm:grid-cols-4 [&>li>a]:block [&>li>a]:rounded-lg [&>li>a]:border [&>li>a]:px-3 [&>li>a]:py-2 [&>li>a]:text-center [&>li>a]:transition hover:[&>li>a]:bg-muted'>
      {KMAP_CASES.map(c => (
        <li key={c}>
          <Link href={`/kmap/${c}`}>{c}</Link>
        </li>
      ))}
    </ul>
  </main>
)
export default Page
