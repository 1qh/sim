/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
/** biome-ignore-all lint/nursery/useGlobalThis: noise */
/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/** biome-ignore-all lint/suspicious/noMisplacedAssertion: noise */
/** biome-ignore-all lint/nursery/noComponentHookFactories: noise */
/** biome-ignore-all lint/nursery/noContinue: noise */
/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/** biome-ignore-all lint/performance/noNamespaceImport: noise */
/** biome-ignore-all lint/complexity/noUselessStringRaw: noise */
/** biome-ignore-all lint/complexity/useMaxParams: noise */
/** biome-ignore-all lint/a11y/noNoninteractiveElementInteractions: modal backdrop dismiss; Esc handled */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: modal backdrop dismiss; Esc handled */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: modal backdrop dismiss; Esc handled, buttons keyboard-reachable */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-static-element-interactions, jsx-a11y/prefer-tag-over-role */
'use client'
import { cn } from '@a/ui'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { LEARN_PAGES, MIPS_EXAMPLES } from '@/features/learn/manifest'

interface Item {
  href: string
  kind: 'example' | 'instruction' | 'learn' | 'route'
  title: string
}
const INSTRUCTIONS = ['add', 'addi', 'and', 'beq', 'bne', 'lw', 'or', 'slt', 'sub', 'sw']
const buildIndex = (): Item[] => [
  { href: '/mips', kind: 'route', title: 'MIPS datapath' },
  { href: '/kmap', kind: 'route', title: 'Karnaugh map' },
  { href: '/pipeline', kind: 'route', title: 'Pipeline analyzer' },
  { href: '/compare', kind: 'route', title: 'Compare instructions' },
  { href: '/learn', kind: 'route', title: 'Learn' },
  ...LEARN_PAGES.map(p => ({ href: `/learn/${p.slug}`, kind: 'learn' as const, title: p.title })),
  ...INSTRUCTIONS.map(n => ({ href: `/mips/${n}`, kind: 'instruction' as const, title: `instruction ${n}` })),
  ...MIPS_EXAMPLES.map(s => ({ href: `/mips?example=${s}`, kind: 'example' as const, title: `example ${s}` }))
]
const INDEX = buildIndex()
const CommandPalette = (): React.JSX.Element | undefined => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === ':' && !open)) {
        e.preventDefault()
        setOpen(v => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [open])
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (needle.length === 0) return INDEX.slice(0, 8)
    return INDEX.filter(i => i.title.toLowerCase().includes(needle)).slice(0, 12)
  }, [q])
  if (!open) return
  return (
    <div
      aria-label='command palette'
      aria-modal
      className='fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[15vh]'
      onClick={() => setOpen(false)}
      role='dialog'>
      <div
        className='w-full max-w-lg overflow-hidden rounded-lg border bg-background shadow-xl'
        onClick={e => e.stopPropagation()}>
        <input
          aria-label='search'
          className='w-full border-b bg-transparent px-4 py-3 font-mono text-sm outline-none'
          onChange={e => setQ(e.target.value)}
          placeholder='Jump to route, lesson, instruction, example…'
          value={q}
        />
        <ul className='max-h-80 overflow-y-auto'>
          {results.map(r => (
            <li key={r.href}>
              <button
                className={cn('flex w-full items-center justify-between px-4 py-2 text-left text-sm hover:bg-muted')}
                onClick={() => {
                  setOpen(false)
                  router.push(r.href)
                }}
                type='button'>
                <span>{r.title}</span>
                <span className='font-mono text-xs text-muted-foreground'>{r.kind}</span>
              </button>
            </li>
          ))}
          {results.length === 0 ? <li className='px-4 py-3 text-sm text-muted-foreground'>no matches</li> : undefined}
        </ul>
      </div>
    </div>
  )
}
export default CommandPalette
