'use client'
import dynamic from 'next/dynamic'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals } from '@/features/mips/types'

const DatapathScene = dynamic(async () => import('./datapath-scene'), {
  loading: () => <div className='size-full animate-pulse bg-muted/20' />,
  ssr: false
})
const DatapathIsland = ({
  control,
  critical,
  step,
  showCritical,
  selected,
  onSelect
}: {
  control: ControlSignals
  critical: readonly string[]
  onSelect: (id: string) => void
  selected: string | undefined
  showCritical: boolean
  step: Step
}) => (
  <DatapathScene
    control={control}
    critical={critical}
    onSelect={onSelect}
    selected={selected}
    showCritical={showCritical}
    step={step}
  />
)
export default DatapathIsland
