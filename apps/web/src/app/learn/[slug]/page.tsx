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
