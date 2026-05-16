import Link from 'next/link'
const Page = () => (
  <main className='flex min-h-screen flex-col gap-4 p-8'>
    <h1 className='text-3xl font-bold'>Share</h1>
    <p className='text-muted-foreground text-sm'>Browse a recent shared snapshot:</p>
    <Link className='text-sm underline' href='/s/abc123'>
      /s/abc123
    </Link>
    <Link className='text-sm underline' href='/s/golden'>
      /s/golden
    </Link>
  </main>
)
export default Page
