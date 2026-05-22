import Link from 'next/link'

const Page = (): React.JSX.Element => (
  <main aria-label='accessibility statement' className='mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8'>
    <h1 className='text-3xl font-bold'>Accessibility</h1>
    <p>
      Targets WCAG 2.2 Level AA on every interactive surface. Keyboard-first navigation, full screen-reader support via DOM
      proxies, color-blind palettes, reduced-motion alternates. Accessibility tests fail the build before deploy.
    </p>
    <h2 className='text-xl font-semibold'>What works</h2>
    <ul className='list-disc pl-6 [&>li]:py-1'>
      <li>Every action is invocable without a mouse; the keyboard matrix is in the in-app help overlay.</li>
      <li>3D scenes carry DOM proxies with ARIA labels for every active component and signal value.</li>
      <li>Live regions announce step changes politely.</li>
      <li>Body text contrast ≥ 7:1; UI chrome ≥ 4.5:1; color is never the sole carrier of meaning.</li>
      <li>Deuteranopia, protanopia, and tritanopia palettes are selectable.</li>
      <li>Reduced motion collapses every animation to an instantaneous state swap with no information lost.</li>
    </ul>
    <h2 className='text-xl font-semibold'>Known limitations</h2>
    <ul className='list-disc pl-6 [&>li]:py-1'>
      <li>
        Below ~1024px the editor and drag-grouping are read-only; learn pages and shared snapshots stay fully readable.
      </li>
      <li>Latest stable Chrome, Edge, Firefox, Safari only.</li>
    </ul>
    <Link className='text-sm underline' href='/'>
      back
    </Link>
  </main>
)
export default Page
