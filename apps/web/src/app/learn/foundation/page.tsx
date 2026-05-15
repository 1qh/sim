import Link from 'next/link'
const Page = () => (
  <main className='flex min-h-screen flex-col gap-8 p-8'>
    <h1 className='text-3xl font-bold'>Foundation demos</h1>
    <p className='text-muted-foreground'>Per-substrate-package generic showcase (no MIPS / K-map domain vocab).</p>
    <ul className='list-disc pl-6'>
      <li>@sim/bits — U32 / S32 primitives</li>
      <li>@sim/boolean — parser + truth table + Quine-McCluskey</li>
      <li>@sim/design-tokens — OKLCH palette × color-blind variants</li>
      <li>@sim/sim-engine — deterministic state machine + snapshot codec</li>
      <li>@sim/three-kit — R3F + TSL substrate (3D placeholder)</li>
      <li>@sim/hud — uikit overlay (3D placeholder)</li>
      <li>@sim/editor — monaco wrapper (placeholder)</li>
    </ul>
    <Link className='text-sm underline' href='/'>
      back
    </Link>
  </main>
)
export default Page
