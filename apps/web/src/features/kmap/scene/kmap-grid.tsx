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
/** biome-ignore-all lint/suspicious/noArrayIndexKey: k-map cell index IS the minterm identity */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, react/no-array-index-key */
/* eslint-disable no-bitwise, react/hook-use-state */
'use client'
import { cn } from '@a/ui'
import { useMemo, useState } from 'react'
import { kmap } from '@/features/kmap'
interface Group {
  cells: number[]
}
const isPow2 = (n: number): boolean => n > 0 && (n & (n - 1)) === 0
const KmapGrid = ({ minterms, vars }: { minterms: number[]; vars: number }): React.JSX.Element => {
  const cells = 2 ** vars
  const cols = 2 ** Math.ceil(vars / 2)
  const result = useMemo(() => kmap({ minterms, width: vars }), [minterms, vars])
  const [dragStart, setDragStart] = useState<number | undefined>(undefined)
  const [hover, setHover] = useState<number | undefined>(undefined)
  const [groups, setGroups] = useState<Group[]>([])
  const [, setRedo] = useState<Group[][]>([])
  const rectCells = (a: number, b: number): number[] => {
    const ar = Math.floor(a / cols)
    const ac = a % cols
    const br = Math.floor(b / cols)
    const bc = b % cols
    const out: number[] = []
    for (let r = Math.min(ar, br); r <= Math.max(ar, br); r += 1)
      for (let c = Math.min(ac, bc); c <= Math.max(ac, bc); c += 1) out.push(r * cols + c)
    return out
  }
  const preview = dragStart !== undefined && hover !== undefined ? rectCells(dragStart, hover) : []
  const commit = (sel: number[]): void => {
    if (!isPow2(sel.length)) return
    setGroups(g => [...g, { cells: sel }])
    setRedo([])
  }
  const undo = (): void =>
    setGroups(g => {
      if (g.length === 0) return g
      setRedo(r => [...r, g])
      return g.slice(0, -1)
    })
  const doRedo = (): void =>
    setRedo(r => {
      const last = r.at(-1)
      if (!last) return r
      setGroups(last)
      return r.slice(0, -1)
    })
  return (
    <section aria-label={`k-map grouping ${vars} vars`} className='flex flex-col gap-3'>
      <div
        className={cn(
          'grid w-fit gap-1',
          cols === 2 && 'grid-cols-2',
          cols === 4 && 'grid-cols-4',
          cols === 8 && 'grid-cols-8'
        )}>
        {Array.from({ length: cells }, (_, i) => {
          const on = minterms.includes(i)
          const inGroup = groups.some(g => g.cells.includes(i))
          const inPreview = preview.includes(i)
          return (
            <button
              aria-label={`cell ${i}, value ${on ? 1 : 0}`}
              aria-pressed={inGroup}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded border font-mono text-xs',
                on ? 'bg-primary/30' : 'bg-muted/20',
                inGroup && 'ring-2 ring-primary',
                inPreview && 'ring-2 ring-amber-400'
              )}
              key={i}
              onPointerDown={() => setDragStart(i)}
              onPointerEnter={() => setHover(i)}
              onPointerUp={() => {
                if (dragStart !== undefined) commit(rectCells(dragStart, i))
                setDragStart(undefined)
              }}
              type='button'>
              {on ? 1 : 0}
            </button>
          )
        })}
      </div>
      <div className='flex gap-2 font-mono text-sm'>
        <button className='rounded border px-3 py-1' onClick={undo} type='button'>
          undo
        </button>
        <button className='rounded border px-3 py-1' onClick={doRedo} type='button'>
          redo
        </button>
        <span className='text-muted-foreground'>groups: {groups.length} · snap-to-2^k enforced · drag a rectangle</span>
      </div>
      <dl className='rounded-lg border p-4 font-mono text-sm [&>dt]:text-muted-foreground'>
        <dt>minimal SOP</dt>
        <dd>{result.minimalSop}</dd>
        <dt>prime implicants / essential</dt>
        <dd>
          {result.primeImplicants.length} / {result.essentialPrimeImplicants.length}
        </dd>
      </dl>
    </section>
  )
}
export default KmapGrid
