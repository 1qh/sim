import Link from 'next/link'
const Page = () => (
  <main className='flex min-h-screen flex-col gap-8 p-8'>
    <h1 className='text-3xl font-bold'>Compare</h1>
    <p className='text-muted-foreground'>
      Side-by-side execution-step diff with synchronized step + register + memory + control comparison.
    </p>
    <Link className='text-sm underline' href='/'>
      back
    </Link>
  </main>
)
export default Page
