import Link from 'next/link'

const Page = (): React.JSX.Element => (
  <main aria-label='terms of service' className='mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8'>
    <h1 className='text-3xl font-bold'>Terms</h1>
    <p>A free interactive visualizer for MIPS datapath and Karnaugh maps. Use at your own discretion.</p>
    <h2 className='text-xl font-semibold'>Use it for</h2>
    <ul className='list-disc pl-6 [&>li]:py-1'>
      <li>Learning low-level computer architecture and Boolean minimization.</li>
      <li>Sharing sim states with peers via permalink.</li>
    </ul>
    <h2 className='text-xl font-semibold'>Don&apos;t</h2>
    <ul className='list-disc pl-6 [&>li]:py-1'>
      <li>Share abusive content via permalinks or scrape the entire shared-snapshot space.</li>
      <li>Reverse-engineer the infrastructure to attack other users.</li>
    </ul>
    <p>
      Substrate packages are MIT-licensed and reusable per MIT terms; the product application is proprietary. Provided
      as-is with no warranty and no uptime guarantee.
    </p>
    <Link className='text-sm underline' href='/'>
      back
    </Link>
  </main>
)
export default Page
