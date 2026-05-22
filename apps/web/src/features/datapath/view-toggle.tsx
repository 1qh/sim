'use client'
import { cn } from '@a/ui'
import type { View } from '@/features/datapath/use-view-mode'

const LABEL: Record<View, string> = { '2d': '2D', '3d': '3D', ref: 'REF 2D' }
const ViewToggle = ({
  views,
  view,
  setView
}: {
  setView: (v: View) => void
  view: View
  views: readonly View[]
}): React.JSX.Element => (
  <div className='flex overflow-hidden rounded-lg border text-sm [&>button]:px-3 [&>button]:py-1'>
    {views.map(v => (
      <button
        className={cn(v === view ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}
        key={v}
        onClick={() => setView(v)}
        type='button'>
        {LABEL[v]}
      </button>
    ))}
  </div>
)
export default ViewToggle
