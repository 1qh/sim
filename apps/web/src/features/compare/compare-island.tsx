'use client'
import { useState } from 'react'
import type { ControlSignals } from '@/features/mips/types'
import DatapathIsland from '@/features/datapath/scene/datapath-island'

interface Pane {
  control: ControlSignals
  name: string
  values: Record<string, string>
}
const noop = (): undefined => undefined
const ComparePane = ({ pane, side }: { pane: Pane; side: 'left' | 'right' }): React.JSX.Element => (
  <section aria-label={`compare ${side}: ${pane.name}`} className='flex min-w-0 flex-1 flex-col gap-2'>
    <h2 className='font-mono text-sm text-muted-foreground'>
      {side} · {pane.name}
    </h2>
    <div className='h-[60vh] overflow-hidden rounded-lg border'>
      <DatapathIsland control={pane.control} onSelect={noop} selected={undefined} step='EX' />
    </div>
    <dl className='flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-xs text-muted-foreground [&>dt]:text-foreground'>
      {Object.entries(pane.values).map(([id, v]) => (
        <div className='flex gap-1' key={id}>
          <dt>{id}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  </section>
)
const CompareIsland = ({
  left,
  right,
  controlDiff
}: {
  controlDiff: readonly string[]
  left: Pane
  right: Pane
}): React.JSX.Element => {
  const [mounted, setMounted] = useState(false)
  return (
    <div className='flex flex-col gap-6'>
      {mounted ? (
        <div className='flex flex-col gap-6 lg:flex-row'>
          <ComparePane pane={left} side='left' />
          <ComparePane pane={right} side='right' />
        </div>
      ) : (
        <button
          className='self-start rounded-lg border px-4 py-2 text-sm hover:bg-muted'
          onClick={() => setMounted(true)}
          type='button'>
          Render 3D comparison ({left.name} vs {right.name})
        </button>
      )}
      <section aria-label='control-signal diff' className='rounded-lg border p-4 font-mono text-sm'>
        <h2 className='mb-2 font-bold'>
          {left.name} vs {right.name}
        </h2>
        {controlDiff.length === 0 ? (
          <p className='text-muted-foreground'>identical control signals</p>
        ) : (
          <ul className='[&>li]:py-0.5'>
            {controlDiff.map(d => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
export default CompareIsland
export type { Pane }
