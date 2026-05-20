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
'use client'
import { cn } from '@a/ui'
import { useMemo, useState } from 'react'
import { kmap } from '@/features/kmap'

const KmapInteractive = ({ minterms, vars }: { minterms: number[]; vars: number }): React.JSX.Element => {
  const [reveal, setReveal] = useState(false)
  const [picked, setPicked] = useState<number[]>([])
  const result = useMemo(() => kmap({ minterms, width: vars }), [minterms, vars])
  const cells = 2 ** vars
  const cols = 2 ** Math.ceil(vars / 2)
  const toggle = (i: number): void =>
    setPicked(p => (p.includes(i) ? p.filter(x => x !== i) : [...p, i].toSorted((a, b) => a - b)))
  return (
    <section aria-label={`interactive k-map ${vars} variables`} className='my-4 flex flex-col gap-3 rounded-lg border p-4'>
      <div
        className={cn(
          'grid w-fit gap-1',
          cols === 2 && 'grid-cols-2',
          cols === 4 && 'grid-cols-4',
          cols === 8 && 'grid-cols-8'
        )}>
        {Array.from({ length: cells }, (_, i) => {
          const on = minterms.includes(i)
          const sel = picked.includes(i)
          return (
            <button
              aria-label={`cell ${i}, value ${on ? 1 : 0}${sel ? ', selected' : ''}`}
              aria-pressed={sel}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded border font-mono text-xs',
                on ? 'bg-primary/30' : 'bg-muted/20',
                sel && 'ring-2 ring-primary'
              )}
              key={i}
              onClick={() => toggle(i)}
              type='button'>
              {on ? 1 : 0}
            </button>
          )
        })}
      </div>
      <div className='flex gap-2'>
        <button
          aria-pressed={reveal}
          className={cn('rounded border px-3 py-1 text-sm', reveal && 'bg-primary')}
          onClick={() => setReveal(v => !v)}
          type='button'>
          {reveal ? 'hide solution' : 'reveal solution'}
        </button>
        <button className='rounded border px-3 py-1 text-sm' onClick={() => setPicked([])} type='button'>
          clear selection
        </button>
      </div>
      <dl className='font-mono text-sm [&>dt]:text-muted-foreground'>
        <dt>your selection</dt>
        <dd>{picked.length === 0 ? '—' : `m(${picked.join(',')})`}</dd>
        {reveal ? (
          <>
            <dt>minimal SOP</dt>
            <dd>{result.minimalSop}</dd>
            <dt>prime implicants</dt>
            <dd>{result.primeImplicants.length}</dd>
          </>
        ) : undefined}
      </dl>
    </section>
  )
}
export default KmapInteractive
