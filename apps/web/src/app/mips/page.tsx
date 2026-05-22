import { Code2 } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { label: 'Arithmetic', names: ['add', 'addi', 'sub', 'slt'] },
  { label: 'Logical', names: ['and', 'andi', 'or', 'ori', 'nor', 'sll', 'srl', 'lui'] },
  { label: 'Memory', names: ['lw', 'sw'] },
  { label: 'Branch', names: ['beq', 'bne'] },
  { label: 'Jump', names: ['j'] }
]
const Page = (): React.JSX.Element => (
  <main aria-label='mips index' className='mx-auto flex min-h-screen max-w-4xl flex-col gap-8 p-8 pt-20'>
    <header className='flex flex-col gap-2'>
      <h1 className='text-4xl font-bold tracking-tight'>MIPS datapath</h1>
      <p className='max-w-2xl text-lg text-muted-foreground'>
        Study one instruction in the sandbox, or write a full program — both drive the live single-cycle datapath.
      </p>
    </header>
    <Link
      className='flex items-center gap-3 rounded-xl border bg-muted/30 p-4 transition hover:border-foreground hover:bg-muted'
      href='/mips/assembly'>
      <Code2 className='size-6 shrink-0' />
      <span className='flex flex-col'>
        <span className='font-medium'>Write assembly</span>
        <span className='text-sm text-muted-foreground'>
          Free-form program editor — run, step, watch registers and memory.
        </span>
      </span>
    </Link>
    {CATEGORIES.map(cat => (
      <section className='flex flex-col gap-2' key={cat.label}>
        <h2 className='font-mono text-xs text-muted-foreground uppercase tracking-wide'>{cat.label}</h2>
        <ul className='grid grid-cols-3 gap-2 font-mono sm:grid-cols-5 [&>li>a]:block [&>li>a]:rounded-lg [&>li>a]:border [&>li>a]:px-3 [&>li>a]:py-2 [&>li>a]:text-center [&>li>a]:transition hover:[&>li>a]:bg-muted'>
          {cat.names.map(n => (
            <li key={n}>
              <Link href={`/mips/${n}`}>{n}</Link>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </main>
)
export default Page
