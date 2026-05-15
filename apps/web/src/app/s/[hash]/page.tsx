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
